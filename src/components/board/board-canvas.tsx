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

export interface CanvasNote {
  id: string;
  topic: string;
  imageWords: string | null;
  x: number;
  y: number;
}

export interface CanvasConnection {
  id: string;
  sourceNoteId: string;
  targetNoteId: string;
  kind: ConnectionKind;
}

export interface BoardCanvasProps {
  notes: CanvasNote[];
  connections?: CanvasConnection[];
  onNoteMove: (noteId: string, position: Position) => void;
  onNoteClick?: (noteId: string) => void;
  onConnectionClick?: (connectionId: string) => void;
  // Kliknięcie tła planszy; położenie w układzie planszy (nie ekranu).
  onPaneClick?: (position: Position) => void;
  // Tryb wskazywania miejsca — zmienia kursor nad tłem.
  placing?: boolean;
  // Karteczka wyróżniona jako początek tworzonego połączenia.
  highlightedNoteId?: string | null;
  selectedConnectionId?: string | null;
}

const NODE_TYPES = { note: NoteNode };
const EDGE_TYPES = { connection: ConnectionEdge };
const NO_CONNECTIONS: CanvasConnection[] = [];

function toNode(note: CanvasNote, highlightedNoteId: string | null): NoteFlowNode {
  return {
    id: note.id,
    type: "note",
    position: { x: note.x, y: note.y },
    data: {
      topic: note.topic,
      imageWords: note.imageWords,
      highlighted: note.id === highlightedNoteId,
    },
  };
}

function toEdge(connection: CanvasConnection, selectedId: string | null): ConnectionFlowEdge {
  return {
    id: connection.id,
    type: "connection",
    source: connection.sourceNoteId,
    target: connection.targetNoteId,
    selected: connection.id === selectedId,
    data: { kind: connection.kind },
    markerEnd:
      connection.kind === "chain"
        ? { type: MarkerType.ArrowClosed, color: "var(--color-edge-chain)", width: 18, height: 18 }
        : undefined,
  };
}

function Canvas({
  notes,
  connections = NO_CONNECTIONS,
  onNoteMove,
  onNoteClick,
  onConnectionClick,
  onPaneClick,
  placing = false,
  highlightedNoteId = null,
  selectedConnectionId = null,
}: BoardCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<NoteFlowNode>(
    notes.map((note) => toNode(note, highlightedNoteId)),
  );

  // Serwer jest źródłem prawdy: każda zmiana listy karteczek nadpisuje lokalny stan węzłów.
  useEffect(() => {
    setNodes((current) => {
      const selected = new Set(current.filter((node) => node.selected).map((node) => node.id));
      return notes.map((note) => ({
        ...toNode(note, highlightedNoteId),
        selected: selected.has(note.id),
      }));
    });
  }, [notes, highlightedNoteId, setNodes]);

  const edges = useMemo(
    () => connections.map((connection) => toEdge(connection, selectedConnectionId)),
    [connections, selectedConnectionId],
  );

  // Położenie zapisujemy raz, po upuszczeniu — nie przy każdym ruchu.
  const handleNodeDragStop = useCallback<OnNodeDrag<NoteFlowNode>>(
    (_event, node) => {
      onNoteMove(node.id, { x: node.position.x, y: node.position.y });
    },
    [onNoteMove],
  );

  const handleNodeClick = useCallback<NodeMouseHandler<NoteFlowNode>>(
    (_event, node) => onNoteClick?.(node.id),
    [onNoteClick],
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
