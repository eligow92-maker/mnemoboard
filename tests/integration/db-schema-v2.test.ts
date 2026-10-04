import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "../helpers/db";

describe("TASK-024 Migracja schematu iteracji 2", () => {
  beforeEach(async () => {
    await resetDb();
    await prisma.pegWord.deleteMany({ where: { number: { in: ["33", "333"] } } });
  });

  it("AC-1: karteczka zapisana bez koloru, opowiadania i emotek ma kolor yellow oraz puste opowiadanie i emotki", async () => {
    const board = await prisma.board.create({ data: { name: "Historia Polski" } });
    const created = await prisma.note.create({
      data: { boardId: board.id, topic: "1410", x: 0, y: 0 },
    });

    const note = await prisma.note.findUniqueOrThrow({ where: { id: created.id } });

    expect(note.color).toBe("yellow");
    expect(note.story).toBeNull();
    expect(note.emoji).toBeNull();
  });

  it('AC-2: zapis hasła "333" bez słowa startowego się udaje', async () => {
    const pegWord = await prisma.pegWord.create({ data: { number: "333", word: "mumia-mysz" } });

    expect(pegWord).toMatchObject({ number: "333", word: "mumia-mysz", defaultWord: null });
  });

  it('AC-3: baza odrzuca zapis hasła "33" bez słowa startowego błędem ograniczenia CHECK', async () => {
    await expect(prisma.pegWord.create({ data: { number: "33", word: "mama" } })).rejects.toThrow(
      /peg_word_default_word_check/,
    );
  });
});
