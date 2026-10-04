import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "../helpers/db";

async function createBoardWithNotes(topics: string[]) {
  const board = await prisma.board.create({ data: { name: "Historia Polski" } });
  const notes = [];
  for (const topic of topics) {
    notes.push(await prisma.note.create({ data: { boardId: board.id, topic, x: 0, y: 0 } }));
  }
  return { board, notes };
}

describe("TASK-002 Schemat bazy i migracja", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("AC-1: po wykonaniu migracji istnieją tabele board, zone, note, connection, peg_word, review_session i review_result", async () => {
    const rows = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    `;

    expect(rows.map((row) => row.table_name)).toEqual(
      expect.arrayContaining([
        "board",
        "zone",
        "note",
        "connection",
        "peg_word",
        "review_session",
        "review_result",
      ]),
    );
  });

  it("AC-2: baza odrzuca drugie połączenie tej samej pary w odwrotnym kierunku błędem unikalności", async () => {
    const { board, notes } = await createBoardWithNotes(["A", "B"]);
    const [a, b] = notes;
    await prisma.connection.create({
      data: { boardId: board.id, sourceNoteId: a.id, targetNoteId: b.id },
    });

    await expect(
      prisma.connection.create({
        data: { boardId: board.id, sourceNoteId: b.id, targetNoteId: a.id },
      }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("AC-3: baza odrzuca drugie ogniwo łańcucha wychodzące z tej samej karteczki błędem unikalności", async () => {
    const { board, notes } = await createBoardWithNotes(["A", "B", "C"]);
    const [a, b, c] = notes;
    await prisma.connection.create({
      data: { boardId: board.id, sourceNoteId: a.id, targetNoteId: b.id, kind: "chain" },
    });

    await expect(
      prisma.connection.create({
        data: { boardId: board.id, sourceNoteId: a.id, targetNoteId: c.id, kind: "chain" },
      }),
    ).rejects.toMatchObject({ code: "P2002" });
  });
});
