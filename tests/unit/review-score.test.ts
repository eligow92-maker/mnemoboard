import { describe, expect, it } from "vitest";
import { percent } from "@/modules/review/score";

describe("review/score", () => {
  it.each([
    [8, 10, 80],
    [2, 3, 67],
    [1, 3, 33],
    [1, 2, 50],
    [0, 5, 0],
    [5, 5, 100],
    [1, 200, 1],
    [0, 0, 0],
  ])("%i z %i to %i%%", (remembered, total, expected) => {
    expect(percent(remembered, total)).toBe(expected);
  });
});
