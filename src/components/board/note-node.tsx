import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

export interface NoteNodeData extends Record<string, unknown> {
  topic: string;
  imageWords: string | null;
  // Numer kolejności w łańcuchu; null poza łańcuchem.
  chainPosition: number | null;
  // Karteczka wskazana jako początek tworzonego połączenia.
  highlighted: boolean;
}

export type NoteFlowNode = Node<NoteNodeData, "note">;

// Uchwyty są niewidoczne i nieklikalne — połączenia tworzy się trybem z paska narzędzi,
// a React Flow potrzebuje uchwytów tylko po to, by narysować linię.
const HANDLE_CLASS = "!pointer-events-none !top-1/2 !left-1/2 !h-px !w-px !border-0 !opacity-0";

export function NoteNode({ data, selected, dragging }: NodeProps<NoteFlowNode>) {
  return (
    <div
      className={`relative min-h-24 w-[180px] rounded-sm border p-2 text-sm text-text-primary ${
        selected || data.highlighted
          ? "border-primary bg-note-selected"
          : "border-note-border bg-note"
      } ${data.highlighted ? "ring-2 ring-primary" : ""} ${
        dragging ? "shadow-note-drag" : "shadow-note"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className={HANDLE_CLASS}
      />
      {data.chainPosition !== null && (
        <span
          aria-label={`Kolejność w łańcuchu: ${data.chainPosition}`}
          className="absolute -top-3 -right-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white shadow-note"
        >
          {data.chainPosition}
        </span>
      )}
      <p className="font-medium break-words whitespace-pre-wrap">{data.topic}</p>
      {data.imageWords && (
        <p className="mt-1 break-words whitespace-pre-wrap text-text-secondary">
          {data.imageWords}
        </p>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className={HANDLE_CLASS}
      />
    </div>
  );
}
