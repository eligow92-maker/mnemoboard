import { NodeResizer, type Node, type NodeProps } from "@xyflow/react";

export const ZONE_MIN_SIZE = 160;
export const ZONE_DEFAULT_WIDTH = 320;
export const ZONE_DEFAULT_HEIGHT = 240;
// Strefę przesuwa się tylko za etykietę — reszta jej powierzchni przepuszcza dotyk do planszy.
export const ZONE_DRAG_HANDLE_CLASS = "zone-drag-handle";

export interface ZoneRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ZoneNodeData extends Record<string, unknown> {
  name: string;
  onResizeEnd: (rect: ZoneRect) => void;
}

export type ZoneFlowNode = Node<ZoneNodeData, "zone">;

// Nazwany prostokąt pod karteczkami; rozmiar zmienia się uchwytami po zaznaczeniu.
export function ZoneNode({ data, selected }: NodeProps<ZoneFlowNode>) {
  return (
    <div
      className={`h-full w-full rounded-lg border-2 border-dashed border-zone-border bg-zone-fill ${
        selected ? "border-solid" : ""
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={ZONE_MIN_SIZE}
        minHeight={ZONE_MIN_SIZE}
        handleClassName="!pointer-events-auto !h-5 !w-5 !rounded-full !border-zone-border !bg-surface"
        lineClassName="!pointer-events-auto !border-zone-border"
        onResizeEnd={(_event, params) =>
          data.onResizeEnd({
            x: params.x,
            y: params.y,
            width: params.width,
            height: params.height,
          })
        }
      />
      <div
        className={`${ZONE_DRAG_HANDLE_CLASS} pointer-events-auto absolute top-0 left-0 flex min-h-11 max-w-full cursor-grab items-center rounded-tl-md rounded-br-lg bg-secondary px-3 text-sm font-bold text-white`}
      >
        <span className="truncate">{data.name}</span>
      </div>
    </div>
  );
}
