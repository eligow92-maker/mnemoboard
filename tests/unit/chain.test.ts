import { describe, expect, it } from "vitest";
import { chainPositions, chains, validateChainLink } from "@/modules/arrangement/chain";

const link = (sourceNoteId: string, targetNoteId: string) => ({ sourceNoteId, targetNoteId });

describe("arrangement/chain", () => {
  it("numeruje karteczki łańcucha od 1 zgodnie z kierunkiem ogniw", () => {
    const positions = chainPositions([link("b", "c"), link("a", "b")]);

    expect(Object.fromEntries(positions)).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("numeruje każdy z wielu łańcuchów osobno i pomija karteczki spoza łańcucha", () => {
    const positions = chainPositions([link("a", "b"), link("x", "y"), link("y", "z")]);

    expect(Object.fromEntries(positions)).toEqual({ a: 1, b: 2, x: 1, y: 2, z: 3 });
    expect(positions.has("luźna")).toBe(false);
  });

  it("zwraca łańcuchy jako listy karteczek od początku do końca", () => {
    expect(chains([link("b", "c"), link("x", "y"), link("a", "b")])).toEqual([
      ["a", "b", "c"],
      ["x", "y"],
    ]);
  });

  it("odrzuca drugie ogniwo wychodzące z tej samej karteczki", () => {
    expect(validateChainLink([link("a", "b")], "a", "c")).toBe("CHAIN_SUCCESSOR_EXISTS");
  });

  it("odrzuca drugie ogniwo wchodzące do tej samej karteczki", () => {
    expect(validateChainLink([link("a", "b")], "c", "b")).toBe("CHAIN_PREDECESSOR_EXISTS");
  });

  it("odrzuca ogniwo zamykające pętlę", () => {
    expect(validateChainLink([link("a", "b"), link("b", "c")], "c", "a")).toBe("CHAIN_CYCLE");
  });

  it("pozwala dołączyć karteczkę na końcu łańcucha i połączyć dwa łańcuchy", () => {
    expect(validateChainLink([link("a", "b")], "b", "c")).toBeNull();
    expect(validateChainLink([link("a", "b"), link("x", "y")], "b", "x")).toBeNull();
  });
});
