"use client";

import { Background, Controls, ReactFlow, useNodesState, type OnNodeDrag } from "@xyflow/react";
import { useCallback, useEffect } from "react";
import "@xyflow/react/dist/style.css";
import { NoteNode, type NoteFlowNode } from "./note-node";

export interface CanvasNote {
  id: string;
  topic: string;
  imageWords: string | null;
  x: number;
  y: number;
}

export interface BoardCanvasProps {
  notes: CanvasNote[];
  onNoteMove: (noteId: string, position: { x: number; y: number }) => void;
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

export function BoardCanvas({ notes, onNoteMove }: BoardCanvasProps) {
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

  return (
    <div className="h-full min-h-0 w-full flex-1 bg-board" data-testid="board-canvas">
      <ReactFlow
        nodes={nodes}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onNodeDragStop={handleNodeDragStop}
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
    </div>
  );
}
