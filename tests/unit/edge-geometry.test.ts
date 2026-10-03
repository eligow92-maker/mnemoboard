import { describe, expect, it } from "vitest";
import { borderPoint } from "@/components/board/edge-geometry";

const RECT = { x: 0, y: 0, width: 180, height: 96 };

describe("board/edge-geometry", () => {
  it.each([
    [
      { x: 500, y: 48 },
      { x: 180, y: 48 },
    ],
    [
      { x: -300, y: 48 },
      { x: 0, y: 48 },
    ],
    [
      { x: 90, y: 400 },
      { x: 90, y: 96 },
    ],
    [
      { x: 90, y: -400 },
      { x: 90, y: 0 },
    ],
  ])("punkt na krawędzi prostokąta w stronę %j to %j", (toward, expected) => {
    expect(borderPoint(RECT, toward)).toEqual(expected);
  });

  it("dla celu w środku prostokąta zwraca środek", () => {
    expect(borderPoint(RECT, { x: 90, y: 48 })).toEqual({ x: 90, y: 48 });
  });
});
