import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import type { BackupFile } from "@/modules/transfer/schema";
import { restoreBackup } from "@/modules/transfer/service";
import { seedPegWords } from "@/modules/word-images/seed";
import { resetDb } from "../helpers/db";

const NOW = "2026-10-04T12:00:00.000Z";

type BackupBoardInput = Partial<BackupFile["boards"][number]> & { name: string };

function backupBoard(input: BackupBoardInput): BackupFile["boards"][number] {
  return { createdAt: NOW, notes: [], zones: [], connections: [], reviewSessions: [], ...input };
}

function backup(
  pegWords: BackupFile["pegWords"] = [],
  boards: BackupFile["boards"] = [],
): BackupFile {
  return { format: "mnemoboard", version: 1, kind: "backup", exportedAt: NOW, boards, pegWords };
}

// Plansza z 10 karteczkami i ukończoną powtórką o wyniku 8 z 10.
function boardWithReview(name: string): BackupFile["boards"][number] {
  const notes = Array.from({ length: 10 }, (_, index) => ({
    id: randomUUID(),
    zoneId: null,
    topic: `Karteczka ${index + 1}`,
    imageWords: `słowa ${index + 1}`,
    story: null,
    emoji: null,
    color: "yellow" as const,
    x: index * 10,
    y: 0,
    createdAt: NOW,
  }));
  return backupBoard({
    name,
    notes,
    reviewSessions: [
      {
        startedAt: "2026-02-01T10:00:00.000Z",
        finishedAt: "2026-02-01T10:05:00.000Z",
        results: notes.map((note, index) => ({
          noteId: note.id,
          remembered: index < 8,
          answeredAt: "2026-02-01T10:01:00.000Z",
        })),
      },
    ],
  });
}

const wordOf = async (number: string) =>
  (await prisma.pegWord.findUniqueOrThrow({ where: { number } })).word;

describe("TASK-035 Przywracanie kopii — reguły scalania", () => {
  beforeEach(async () => {
    await resetDb();
    await prisma.pegWord.deleteMany();
    await seedPegWords(prisma);
  });

  it('AC-1: hasło "14" o słowie równym startowemu przyjmuje słowo "tur" z kopii', async () => {
    const result = await restoreBackup(backup([{ number: "14", word: "tur" }]), { dryRun: false });

    expect(await wordOf("14")).toBe("tur");
    expect(result).toMatchObject({ pegWordsUpdated: 1, customPegWordsAdded: 0 });
  });

  it('AC-2: hasło "14" zmienione przez użytkownika na "tara" zachowuje "tara" mimo słowa "tur" w kopii', async () => {
    await prisma.pegWord.update({ where: { number: "14" }, data: { word: "tara" } });

    const result = await restoreBackup(backup([{ number: "14", word: "tur" }]), { dryRun: false });

    expect(await wordOf("14")).toBe("tara");
    expect(result.pegWordsUpdated).toBe(0);
  });

  it('AC-3: istniejący własny wpis "333" ze słowem "mamut" zachowuje "mamut" mimo "mumia-mysz" w kopii', async () => {
    await prisma.pegWord.create({ data: { number: "333", word: "mamut" } });

    const result = await restoreBackup(backup([{ number: "333", word: "mumia-mysz" }]), {
      dryRun: false,
    });

    expect(await wordOf("333")).toBe("mamut");
    expect(result.customPegWordsAdded).toBe(0);
  });

  it("AC-4: plansza z kopii z ukończoną powtórką 8 z 10 trafia jako nowa z 10 wynikami przypisanymi do jej własnych karteczek", async () => {
    const file = backup([], [boardWithReview("Biologia")]);
    const originalNoteIds = new Set(file.boards[0].notes.map((note) => note.id));

    const result = await restoreBackup(file, { dryRun: false });

    expect(result.boardsAdded).toBe(1);
    const board = await prisma.board.findFirstOrThrow({
      include: {
        notes: true,
        reviewSessions: { include: { results: true } },
      },
    });
    expect(board.notes).toHaveLength(10);
    expect(board.reviewSessions).toHaveLength(1);
    const [session] = board.reviewSessions;
    expect(session.finishedAt).not.toBeNull();
    expect(session.results).toHaveLength(10);
    expect(session.results.filter((r) => r.remembered)).toHaveLength(8);
    const ownIds = new Set(board.notes.map((note) => note.id));
    for (const resultRow of session.results) expect(ownIds.has(resultRow.noteId)).toBe(true);
    for (const id of ownIds) expect(originalNoteIds.has(id)).toBe(false);
  });

  it("własne wpisy z kopii, których brak, są dodawane, a pozostałe nie są ruszane", async () => {
    await prisma.pegWord.create({ data: { number: "333", word: "mamut" } });

    const result = await restoreBackup(
      backup([
        { number: "333", word: "mumia-mysz" },
        { number: "4444", word: "rura" },
      ]),
      { dryRun: false },
    );

    expect(await wordOf("4444")).toBe("rura");
    expect(
      (await prisma.pegWord.findUniqueOrThrow({ where: { number: "4444" } })).defaultWord,
    ).toBeNull();
    expect(result).toMatchObject({ customPegWordsAdded: 1, pegWordsUpdated: 0 });
  });

  it("dryRun zlicza zmiany, ale niczego nie zapisuje", async () => {
    const file = backup(
      [
        { number: "14", word: "tur" },
        { number: "333", word: "mumia-mysz" },
      ],
      [boardWithReview("A"), boardWithReview("B")],
    );

    const result = await restoreBackup(file, { dryRun: true });

    expect(result).toEqual({
      dryRun: true,
      boardsAdded: 2,
      pegWordsUpdated: 1,
      customPegWordsAdded: 1,
    });
    expect(await prisma.board.count()).toBe(0);
    expect(await prisma.pegWord.count({ where: { defaultWord: null } })).toBe(0);
    expect(await wordOf("14")).not.toBe("tur");
  });

  it("przywrócenie nie rusza istniejących plansz, a dwie plansze o tej samej nazwie dostają unikalne nazwy", async () => {
    await prisma.board.create({ data: { name: "Biologia" } });

    await restoreBackup(
      backup([], [backupBoard({ name: "Biologia" }), backupBoard({ name: "Biologia" })]),
      {
        dryRun: false,
      },
    );

    const names = (await prisma.board.findMany({ orderBy: { createdAt: "asc" } })).map(
      (b) => b.name,
    );
    expect(names).toEqual(["Biologia", "Biologia (import)", "Biologia (import 2)"]);
  });

  it("przekroczenie 500 własnych wpisów odrzuca całe przywrócenie, także plansze", async () => {
    const pegs = Array.from({ length: 501 }, (_, index) => ({
      number: String(100000 + index),
      word: "w",
    }));

    await expect(
      restoreBackup(backup(pegs, [backupBoard({ name: "Nowa" })]), { dryRun: false }),
    ).rejects.toMatchObject({ code: "PEG_LIMIT" });

    expect(await prisma.board.count()).toBe(0);
    expect(await prisma.pegWord.count({ where: { defaultWord: null } })).toBe(0);
  });

  it("hasło wbudowane z kopii, którego brak w bazie, jest pomijane", async () => {
    await prisma.pegWord.delete({ where: { number: "14" } });

    const result = await restoreBackup(backup([{ number: "14", word: "tur" }]), { dryRun: false });

    expect(await prisma.pegWord.findUnique({ where: { number: "14" } })).toBeNull();
    expect(result.pegWordsUpdated).toBe(0);
  });
});
