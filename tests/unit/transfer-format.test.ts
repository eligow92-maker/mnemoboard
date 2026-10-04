import { describe, expect, it } from "vitest";
import {
  backupFileName,
  buildBoardExportFile,
  exportFileName,
  parseBackupFile,
  parseBoardExportFile,
} from "@/modules/transfer/format";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";
const ZONE = "44444444-4444-4444-8444-444444444444";
const CREATED = new Date("2026-01-02T10:00:00.000Z");

const note = (id: string, topic: string, extra: Record<string, unknown> = {}) => ({
  id,
  zoneId: null,
  topic,
  imageWords: null,
  story: null,
  emoji: null,
  color: "yellow" as const,
  x: 10,
  y: 20,
  createdAt: CREATED,
  ...extra,
});

const board = (
  connections: { sourceNoteId: string; targetNoteId: string; kind: "association" | "chain" }[],
  notes = [
    note(A, "1410", {
      zoneId: ZONE,
      imageWords: "tor, dos",
      story: "Po torze jedzie dos",
      emoji: "🏰⚔️",
      color: "red",
    }),
    note(B, "966"),
    note(C, "Mitochondrium"),
  ],
) => ({
  name: "Historia Polski",
  createdAt: CREATED,
  notes,
  zones: [{ id: ZONE, name: "Kuchnia", x: 0, y: 0, width: 300, height: 200, createdAt: CREATED }],
  connections,
});

// Plik tak, jak trafia do przeglądarki i wraca przy imporcie.
const roundTrip = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe("TASK-032 Format pliku i walidacja (moduł transfer)", () => {
  it("AC-1: plansza z 3 karteczkami, 1 strefą i 2 połączeniami po zapisie do pliku i wczytaniu zawiera te same 3 karteczki, 1 strefę i 2 połączenia", () => {
    const source = board([
      { sourceNoteId: A, targetNoteId: B, kind: "association" },
      { sourceNoteId: B, targetNoteId: C, kind: "chain" },
    ]);

    const file = buildBoardExportFile(source, new Date("2026-10-04T12:00:00.000Z"));
    const parsed = parseBoardExportFile(roundTrip(file));

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.board.notes).toHaveLength(3);
    expect(parsed.data.board.zones).toHaveLength(1);
    expect(parsed.data.board.connections).toHaveLength(2);
    expect(parsed.data.board.notes[0]).toMatchObject({
      id: A,
      zoneId: ZONE,
      topic: "1410",
      imageWords: "tor, dos",
      story: "Po torze jedzie dos",
      emoji: "🏰⚔️",
      color: "red",
      x: 10,
      y: 20,
    });
    expect(parsed.data.board.zones[0]).toMatchObject({ name: "Kuchnia", width: 300, height: 200 });
    expect(parsed.data.board.connections[1]).toEqual({
      sourceNoteId: B,
      targetNoteId: C,
      kind: "chain",
    });
  });

  it("AC-2: plik z połączeniem wskazującym karteczkę spoza pliku nie przechodzi walidacji", () => {
    const outsider = "99999999-9999-4999-8999-999999999999";
    const file = buildBoardExportFile(
      board([{ sourceNoteId: A, targetNoteId: outsider, kind: "association" }]),
      new Date(),
    );

    expect(parseBoardExportFile(roundTrip(file)).success).toBe(false);
  });

  it("AC-3: plik z ogniwami łańcucha A→B, B→C i C→A nie przechodzi walidacji", () => {
    const file = buildBoardExportFile(
      board([
        { sourceNoteId: A, targetNoteId: B, kind: "chain" },
        { sourceNoteId: B, targetNoteId: C, kind: "chain" },
        { sourceNoteId: C, targetNoteId: A, kind: "chain" },
      ]),
      new Date(),
    );

    expect(parseBoardExportFile(roundTrip(file)).success).toBe(false);
  });

  it('AC-4: nazwa pliku eksportu planszy "Żółta Historia Polski" zawiera "zolta-historia-polski"', () => {
    const name = exportFileName("Żółta Historia Polski", new Date("2026-10-04T12:00:00.000Z"));

    expect(name).toContain("zolta-historia-polski");
    expect(name).toBe("mnemoboard-zolta-historia-polski-2026-10-04.json");
  });

  it("nazwa planszy złożona z samych znaków specjalnych daje nazwę zastępczą", () => {
    expect(exportFileName("???", new Date("2026-10-04T12:00:00.000Z"))).toBe(
      "mnemoboard-plansza-2026-10-04.json",
    );
    expect(backupFileName(new Date("2026-10-04T12:00:00.000Z"))).toBe(
      "mnemoboard-kopia-2026-10-04.json",
    );
  });

  it("odrzuca plik o innym formacie, wersji lub rodzaju", () => {
    const valid = roundTrip(buildBoardExportFile(board([]), new Date()));

    expect(parseBoardExportFile({ ...(valid as object), format: "inny" }).success).toBe(false);
    expect(parseBoardExportFile({ ...(valid as object), version: 2 }).success).toBe(false);
    expect(parseBoardExportFile({ ...(valid as object), kind: "backup" }).success).toBe(false);
    expect(parseBoardExportFile("tekst").success).toBe(false);
    expect(parseBoardExportFile(null).success).toBe(false);
  });

  it("odrzuca powtórzone połączenie tej samej pary, także w odwrotnym kierunku", () => {
    const file = buildBoardExportFile(
      board([
        { sourceNoteId: A, targetNoteId: B, kind: "association" },
        { sourceNoteId: B, targetNoteId: A, kind: "association" },
      ]),
      new Date(),
    );

    expect(parseBoardExportFile(roundTrip(file)).success).toBe(false);
  });

  it("odrzuca strefę, karteczkę z nieznaną strefą, powtórzone identyfikatory i nieznany kolor", () => {
    const withZone = (zoneId: string) => board([], [note(A, "x", { zoneId })]);
    const check = (source: ReturnType<typeof board>) =>
      parseBoardExportFile(roundTrip(buildBoardExportFile(source, new Date()))).success;

    expect(check(withZone("99999999-9999-4999-8999-999999999999"))).toBe(false);
    expect(check(board([], [note(A, "x"), note(A, "y")]))).toBe(false);
    expect(check(board([], [note(A, "x", { color: "purple" })]))).toBe(false);
    expect(check(board([], [note(A, "x", { emoji: "🏰⚔️🐉👑🛡️🗡️🏹🎯🔥" })]))).toBe(false);
    expect(
      check(board([{ sourceNoteId: A, targetNoteId: A, kind: "association" }], [note(A, "x")])),
    ).toBe(false);
  });

  it("plik kopii zawiera plansze z historią powtórek i listę GSP", () => {
    const file = {
      format: "mnemoboard",
      version: 1,
      kind: "backup",
      exportedAt: "2026-10-04T12:00:00.000Z",
      boards: [
        {
          ...(roundTrip(buildBoardExportFile(board([]), new Date())) as { board: object }).board,
          reviewSessions: [
            {
              startedAt: "2026-02-01T10:00:00.000Z",
              finishedAt: "2026-02-01T10:05:00.000Z",
              results: [{ noteId: A, remembered: true, answeredAt: "2026-02-01T10:01:00.000Z" }],
            },
          ],
        },
      ],
      pegWords: [{ number: "333", word: "mumia-mysz" }],
    };

    const parsed = parseBackupFile(file);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.boards[0].reviewSessions[0].results).toHaveLength(1);
    expect(parsed.data.pegWords).toEqual([{ number: "333", word: "mumia-mysz" }]);
  });

  it("odrzuca kopię z wynikiem powtórki dla karteczki spoza planszy", () => {
    const base = roundTrip(buildBoardExportFile(board([]), new Date())) as { board: object };
    const file = {
      format: "mnemoboard",
      version: 1,
      kind: "backup",
      exportedAt: "2026-10-04T12:00:00.000Z",
      boards: [
        {
          ...base.board,
          reviewSessions: [
            {
              startedAt: "2026-02-01T10:00:00.000Z",
              finishedAt: null,
              results: [
                {
                  noteId: "99999999-9999-4999-8999-999999999999",
                  remembered: true,
                  answeredAt: "2026-02-01T10:01:00.000Z",
                },
              ],
            },
          ],
        },
      ],
      pegWords: [],
    };

    expect(parseBackupFile(file).success).toBe(false);
  });
});
