"use client";

import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  type EdgeMouseHandler,
  type NodeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, type MouseEvent } from "react";
import "@xyflow/react/dist/style.css";
import type { ConnectionKind } from "@/lib/api-types";
import { ConnectionEdge, type ConnectionFlowEdge } from "./connection-edge";
import type { Position } from "./dimensions";
import { NoteNode, type NoteFlowNode } from "./note-node";
import { ZONE_DRAG_HANDLE_CLASS, ZoneNode, type ZoneFlowNode, type ZoneRect } from "./zone-node";

export interface CanvasNote {
  id: string;
  topic: string;
  imageWords: string | null;
  story?: string | null;
  chainPosition?: number | null;
  zoneId?: string | null;
  x: number;
  y: number;
}

export interface CanvasConnection {
  id: string;
  sourceNoteId: string;
  targetNoteId: string;
  kind: ConnectionKind;
}

export interface CanvasZone extends ZoneRect {
  id: string;
  name: string;
}

export interface BoardCanvasProps {
  notes: CanvasNote[];
  zones?: CanvasZone[];
  connections?: CanvasConnection[];
  onNoteMove: (noteId: string, position: Position) => void;
  onNoteClick?: (noteId: string) => void;
  // Strefa przesunięta lub przeskalowana — wywoływane raz, po zakończeniu gestu.
  onZoneChange?: (zoneId: string, rect: ZoneRect) => void;
  onZoneClick?: (zoneId: string) => void;
  onConnectionClick?: (connectionId: string) => void;
  // Kliknięcie tła planszy; położenie w układzie planszy (nie ekranu).
  onPaneClick?: (position: Position) => void;
  // Tryb wskazywania miejsca — zmienia kursor nad tłem.
  placing?: boolean;
  // Karteczka wyróżniona jako początek tworzonego połączenia.
  highlightedNoteId?: string | null;
  selectedConnectionId?: string | null;
}

type BoardFlowNode = NoteFlowNode | ZoneFlowNode;

const NODE_TYPES = { note: NoteNode, zone: ZoneNode };
const EDGE_TYPES = { connection: ConnectionEdge };
const NO_CONNECTIONS: CanvasConnection[] = [];
const NO_ZONES: CanvasZone[] = [];

function toNoteNode(
  note: CanvasNote,
  zoneNames: Map<string, string>,
  highlightedNoteId: string | null,
): NoteFlowNode {
  return {
    id: note.id,
    type: "note",
    position: { x: note.x, y: note.y },
    zIndex: 1,
    data: {
      topic: note.topic,
      imageWords: note.imageWords,
      story: note.story ?? null,
      chainPosition: note.chainPosition ?? null,
      zoneName: (note.zoneId && zoneNames.get(note.zoneId)) || null,
      highlighted: note.id === highlightedNoteId,
    },
  };
}

function toZoneNode(zone: CanvasZone, onResizeEnd: (rect: ZoneRect) => void): ZoneFlowNode {
  return {
    id: zone.id,
    type: "zone",
    position: { x: zone.x, y: zone.y },
    width: zone.width,
    height: zone.height,
    // Pod karteczkami; powierzchnia strefy nie przechwytuje dotyku (przesuwanie widoku,
    // wskazywanie miejsca karteczki), aktywna jest tylko etykieta i uchwyty rozmiaru.
    zIndex: 0,
    dragHandle: `.${ZONE_DRAG_HANDLE_CLASS}`,
    style: { pointerEvents: "none" },
    data: { name: zone.name, onResizeEnd },
  };
}

function toEdge(connection: CanvasConnection, selectedId: string | null): ConnectionFlowEdge {
  return {
    id: connection.id,
    type: "connection",
    source: connection.sourceNoteId,
    target: connection.targetNoteId,
    selected: connection.id === selectedId,
    zIndex: 1,
    data: { kind: connection.kind },
    markerEnd:
      connection.kind === "chain"
        ? { type: MarkerType.ArrowClosed, color: "var(--color-edge-chain)", width: 18, height: 18 }
        : undefined,
  };
}

function Canvas({
  notes,
  zones = NO_ZONES,
  connections = NO_CONNECTIONS,
  onNoteMove,
  onNoteClick,
  onZoneChange,
  onZoneClick,
  onConnectionClick,
  onPaneClick,
  placing = false,
  highlightedNoteId = null,
  selectedConnectionId = null,
}: BoardCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<BoardFlowNode>([]);

  // Serwer jest źródłem prawdy: każda zmiana danych planszy nadpisuje lokalny stan węzłów.
  useEffect(() => {
    const zoneNames = new Map(zones.map((zone) => [zone.id, zone.name]));
    setNodes((current) => {
      const selected = new Set(current.filter((node) => node.selected).map((node) => node.id));
      const next: BoardFlowNode[] = [
        ...zones.map((zone) => toZoneNode(zone, (rect) => onZoneChange?.(zone.id, rect))),
        ...notes.map((note) => toNoteNode(note, zoneNames, highlightedNoteId)),
      ];
      return next.map((node) => ({ ...node, selected: selected.has(node.id) }) as BoardFlowNode);
    });
  }, [notes, zones, highlightedNoteId, onZoneChange, setNodes]);

  const edges = useMemo(
    () => connections.map((connection) => toEdge(connection, selectedConnectionId)),
    [connections, selectedConnectionId],
  );

  // Położenie zapisujemy raz, po upuszczeniu — nie przy każdym ruchu.
  const handleNodeDragStop = useCallback<OnNodeDrag<BoardFlowNode>>(
    (_event, node) => {
      const { x, y } = node.position;
      if (node.type === "zone") {
        onZoneChange?.(node.id, { x, y, width: node.width ?? 0, height: node.height ?? 0 });
      } else {
        onNoteMove(node.id, { x, y });
      }
    },
    [onNoteMove, onZoneChange],
  );

  const handleNodeClick = useCallback<NodeMouseHandler<BoardFlowNode>>(
    (_event, node) => {
      if (node.type === "zone") onZoneClick?.(node.id);
      else onNoteClick?.(node.id);
    },
    [onNoteClick, onZoneClick],
  );

  const handleEdgeClick = useCallback<EdgeMouseHandler<ConnectionFlowEdge>>(
    (_event, edge) => onConnectionClick?.(edge.id),
    [onConnectionClick],
  );

  const handlePaneClick = useCallback(
    (event: MouseEvent) => {
      onPaneClick?.(screenToFlowPosition({ x: event.clientX, y: event.clientY }));
    },
    [onPaneClick, screenToFlowPosition],
  );

  return (
    <ReactFlow
      className={placing ? "[&_.react-flow\\_\\_pane]:cursor-crosshair" : undefined}
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      onNodesChange={onNodesChange}
      onNodeDragStop={handleNodeDragStop}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      onPaneClick={handlePaneClick}
      // Dotyk: przeciągnięcie karteczki przesuwa karteczkę, przeciągnięcie tła przesuwa widok,
      // dwa palce powiększają.
      nodesDraggable
      panOnDrag
      zoomOnPinch
      nodesConnectable={false}
      edgesFocusable={false}
      // Zaznaczona strefa nie może wyjść nad karteczki.
      elevateNodesOnSelect={false}
      // Duża plansza (do 200 karteczek): do DOM trafiają tylko elementy widoczne w oknie planszy.
      onlyRenderVisibleElements
      minZoom={0.25}
      maxZoom={2}
      deleteKeyCode={null}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

export function BoardCanvas(props: BoardCanvasProps) {
  return (
    <div className="relative min-h-0 flex-1 bg-board" data-testid="board-canvas">
      <div className="absolute inset-0">
        <ReactFlowProvider>
          <Canvas {...props} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
