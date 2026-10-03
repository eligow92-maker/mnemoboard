import {
  BaseEdge,
  getStraightPath,
  useInternalNode,
  type Edge,
  type EdgeProps,
  type InternalNode,
} from "@xyflow/react";
import type { ConnectionKind } from "@/lib/api-types";
import { NOTE_HEIGHT, NOTE_WIDTH } from "./dimensions";
import { borderPoint, rectCenter, type Rect } from "./edge-geometry";

export interface ConnectionEdgeData extends Record<string, unknown> {
  kind: ConnectionKind;
}

export type ConnectionFlowEdge = Edge<ConnectionEdgeData, "connection">;

function nodeRect(node: InternalNode): Rect {
  return {
    x: node.internals.positionAbsolute.x,
    y: node.internals.positionAbsolute.y,
    width: node.measured.width ?? NOTE_WIDTH,
    height: node.measured.height ?? NOTE_HEIGHT,
  };
}

// Prosta linia między brzegami dwóch karteczek: mapa myśli bez strzałki, łańcuch ze strzałką.
export function ConnectionEdge({
  id,
  source,
  target,
  markerEnd,
  selected,
  data,
}: EdgeProps<ConnectionFlowEdge>) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  if (!sourceNode || !targetNode) return null;

  const sourceRect = nodeRect(sourceNode);
  const targetRect = nodeRect(targetNode);
  const start = borderPoint(sourceRect, rectCenter(targetRect));
  const end = borderPoint(targetRect, rectCenter(sourceRect));
  const [path] = getStraightPath({
    sourceX: start.x,
    sourceY: start.y,
    targetX: end.x,
    targetY: end.y,
  });
  const color =
    data?.kind === "chain" ? "var(--color-edge-chain)" : "var(--color-edge-association)";

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      interactionWidth={28}
      style={{ stroke: color, strokeWidth: selected ? 4 : 2 }}
    />
  );
}
