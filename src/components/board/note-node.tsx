import type { Node, NodeProps } from "@xyflow/react";

export interface NoteNodeData extends Record<string, unknown> {
  topic: string;
  imageWords: string | null;
}

export type NoteFlowNode = Node<NoteNodeData, "note">;

export function NoteNode({ data, selected, dragging }: NodeProps<NoteFlowNode>) {
  return (
    <div
      className={`min-h-24 w-[180px] rounded-sm border p-2 text-sm text-text-primary ${
        selected ? "border-primary bg-note-selected" : "border-note-border bg-note"
      } ${dragging ? "shadow-note-drag" : "shadow-note"}`}
    >
      <p className="font-medium break-words whitespace-pre-wrap">{data.topic}</p>
      {data.imageWords && (
        <p className="mt-1 break-words whitespace-pre-wrap text-text-secondary">
          {data.imageWords}
        </p>
      )}
    </div>
  );
}
