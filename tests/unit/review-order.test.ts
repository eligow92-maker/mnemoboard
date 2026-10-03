import { describe, expect, it } from "vitest";
import { reviewOrder } from "@/modules/review/order";

const note = (id: string, createdAt: string) => ({ id, createdAt: new Date(createdAt) });
const link = (sourceNoteId: string, targetNoteId: string) => ({ sourceNoteId, targetNoteId });

describe("TASK-016 Kolejność kart powtórki", () => {
  it("AC-1: dla planszy z łańcuchem B→C i luźną karteczką A utworzoną najwcześniej kolejność powtórki to B, C, A", () => {
    const notes = [note("A", "2026-01-01"), note("B", "2026-01-02"), note("C", "2026-01-03")];

    expect(reviewOrder(notes, [link("B", "C")])).toEqual(["B", "C", "A"]);
  });

  it("AC-2: dla planszy z luźnymi karteczkami utworzonymi w kolejności A, B, C kolejność powtórki to A, B, C", () => {
    const notes = [note("C", "2026-01-03"), note("A", "2026-01-01"), note("B", "2026-01-02")];

    expect(reviewOrder(notes, [])).toEqual(["A", "B", "C"]);
  });

  it("układa łańcuchy według daty utworzenia ich pierwszej karteczki", () => {
    const notes = [
      note("X", "2026-01-05"),
      note("Y", "2026-01-01"),
      note("P", "2026-01-02"),
      note("Q", "2026-01-09"),
      note("L", "2026-01-03"),
    ];

    // Łańcuch P→Q zaczyna się wcześniej (P: 2.01) niż X→Y (X: 5.01).
    expect(reviewOrder(notes, [link("X", "Y"), link("P", "Q")])).toEqual(["P", "Q", "X", "Y", "L"]);
  });

  it("zachowuje kolejność ogniw, nawet gdy późniejsza karteczka łańcucha powstała wcześniej", () => {
    const notes = [note("A", "2026-01-03"), note("B", "2026-01-02"), note("C", "2026-01-01")];

    expect(reviewOrder(notes, [link("B", "C"), link("A", "B")])).toEqual(["A", "B", "C"]);
  });

  it("pomija ogniwa prowadzące do karteczek spoza listy, nie gubiąc pozostałych", () => {
    const notes = [note("A", "2026-01-01"), note("C", "2026-01-03"), note("D", "2026-01-04")];

    // B (środek łańcucha A→B→C) nie bierze udziału w powtórce.
    expect(reviewOrder(notes, [link("A", "B"), link("B", "C")])).toEqual(["A", "C", "D"]);
  });

  it("zwraca pustą listę dla planszy bez karteczek", () => {
    expect(reviewOrder([], [])).toEqual([]);
  });
});
