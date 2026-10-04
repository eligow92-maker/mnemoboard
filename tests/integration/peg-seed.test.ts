import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { DEFAULT_PEG_WORDS } from "@/modules/word-images/default-peg-words";
import { seedPegWords } from "@/modules/word-images/seed";

describe("TASK-008 Startowa lista GSP i seed", () => {
  beforeEach(async () => {
    await prisma.pegWord.deleteMany();
  });

  it("AC-1: seed uruchomiony na pustej tabeli peg_word zapisuje 110 haseł z niepustym słowem", async () => {
    await seedPegWords(prisma);

    const pegWords = await prisma.pegWord.findMany();
    expect(pegWords).toHaveLength(110);
    expect(pegWords.filter((peg) => peg.word.trim() === "")).toEqual([]);
    expect(pegWords.every((peg) => peg.word === peg.defaultWord)).toBe(true);
  });

  it('AC-3: ponowne uruchomienie seeda zachowuje słowo "tur" ustawione dla hasła "14"', async () => {
    await seedPegWords(prisma);
    await prisma.pegWord.update({ where: { number: "14" }, data: { word: "tur" } });

    await seedPegWords(prisma);

    const peg = await prisma.pegWord.findUniqueOrThrow({ where: { number: "14" } });
    expect(peg.word).toBe("tur");
    expect(peg.defaultWord).toBe(DEFAULT_PEG_WORDS["14"]);
    expect(await prisma.pegWord.count()).toBe(110);
  });

  it("seed uzupełnia brakujące hasła i odświeża niezmienione słowo, gdy zmieniło się słowo startowe", async () => {
    await seedPegWords(prisma);
    await prisma.pegWord.delete({ where: { number: "07" } });
    await prisma.pegWord.update({
      where: { number: "33" },
      data: { word: "stare", defaultWord: "stare" },
    });

    await seedPegWords(prisma);

    expect(await prisma.pegWord.count()).toBe(110);
    expect(await prisma.pegWord.findUniqueOrThrow({ where: { number: "33" } })).toMatchObject({
      word: DEFAULT_PEG_WORDS["33"],
      defaultWord: DEFAULT_PEG_WORDS["33"],
    });
  });
});
