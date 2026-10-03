"use client";

import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  type NodeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react";
import { useCallback, useEffect, type MouseEvent } from "react";
import "@xyflow/react/dist/style.css";
import { NoteNode, type NoteFlowNode } from "./note-node";

export interface CanvasNote {
  id: string;
  topic: string;
  imageWords: string | null;
  x: number;
  y: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface BoardCanvasProps {
  notes: CanvasNote[];
  onNoteMove: (noteId: string, position: Position) => void;
  onNoteClick?: (noteId: string) => void;
  // Kliknięcie tła planszy; położenie w układzie planszy (nie ekranu).
  onPaneClick?: (position: Position) => void;
  // Tryb wskazywania miejsca — zmienia kursor nad tłem.
  placing?: boolean;
}

const NODE_TYPES = { note: NoteNode };

function toNode(note: CanvasNote): NoteFlowNode {
  return {
    id: note.id,
    type: "note",
    position: { x: note.x, y: note.y },
    data: { topic: note.topic, imageWords: note.imageWords },
  };
}

function Canvas({
  notes,
  onNoteMove,
  onNoteClick,
  onPaneClick,
  placing = false,
}: BoardCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<NoteFlowNode>(notes.map(toNode));

  // Serwer jest źródłem prawdy: każda zmiana listy karteczek nadpisuje lokalny stan węzłów.
  useEffect(() => {
    setNodes((current) => {
      const selected = new Set(current.filter((node) => node.selected).map((node) => node.id));
      return notes.map((note) => ({ ...toNode(note), selected: selected.has(note.id) }));
    });
  }, [notes, setNodes]);

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
      nodeTypes={NODE_TYPES}
      onNodesChange={onNodesChange}
      onNodeDragStop={handleNodeDragStop}
      onNodeClick={handleNodeClick}
      onPaneClick={handlePaneClick}
      // Dotyk: przeciągnięcie karteczki przesuwa karteczkę, przeciągnięcie tła przesuwa widok,
      // dwa palce powiększają.
      nodesDraggable
      panOnDrag
      zoomOnPinch
      nodesConnectable={false}
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
