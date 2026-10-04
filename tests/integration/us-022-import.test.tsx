import { randomUUID } from "node:crypto";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardListScreen } from "@/components/boards/board-list-screen";
import { prisma } from "@/lib/db";
import { boardChainPositions } from "@/modules/arrangement/connections";
import { buildBoardExportFile, type BoardSource } from "@/modules/transfer/format";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { resetDb } from "../helpers/db";

const CREATED = new Date("2026-01-02T10:00:00.000Z");

// Plik eksportu planszy z 3 karteczkami, 1 strefą i łańcuchem A→B→C.
function boardFile(name = "Historia Polski"): ReturnType<typeof buildBoardExportFile> {
  const [a, b, c, zone] = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
  const note = (id: string, topic: string, zoneId: string | null) => ({
    id,
    zoneId,
    topic,
    imageWords: `słowa ${topic}`,
    story: topic === "A" ? "Opowiadanie A" : null,
    emoji: topic === "A" ? "🏰⚔️" : null,
    color: topic === "A" ? ("red" as const) : ("yellow" as const),
    x: 10,
    y: 20,
    createdAt: new Date(CREATED.getTime() + topic.charCodeAt(0)),
  });
  const source: BoardSource = {
    name,
    createdAt: CREATED,
    notes: [note(c, "C", null), note(a, "A", zone), note(b, "B", null)],
    zones: [{ id: zone, name: "Kuchnia", x: 0, y: 0, width: 300, height: 300, createdAt: CREATED }],
    connections: [
      { sourceNoteId: a, targetNoteId: b, kind: "chain" },
      { sourceNoteId: b, targetNoteId: c, kind: "chain" },
    ],
  };
  return buildBoardExportFile(source, new Date());
}

const asFile = (content: string, name = "plansza.json") =>
  new File([content], name, { type: "application/json" });

const postImport = (body: string) =>
  apiFetch("/api/boards/import", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

describe("TASK-034 US-022 Import planszy", () => {
  beforeEach(async () => {
    await resetDb();
    installApiFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-1: import pliku eksportu planszy z 3 karteczkami, 1 strefą i łańcuchem A→B→C tworzy nową planszę z 3 karteczkami, 1 strefą i łańcuchem w kolejności A, B, C", async () => {
    const user = userEvent.setup();
    render(<BoardListScreen />);

    await user.upload(
      await screen.findByLabelText("Importuj planszę"),
      asFile(JSON.stringify(boardFile())),
    );

    expect(await screen.findByRole("link", { name: /Historia Polski/ })).toBeInTheDocument();
    const board = await prisma.board.findFirstOrThrow({
      include: { notes: true, zones: true },
    });
    expect(board.notes).toHaveLength(3);
    expect(board.zones).toHaveLength(1);
    const positions = await boardChainPositions(board.id);
    const order = board.notes
      .filter((note) => positions.has(note.id))
      .sort((x, y) => positions.get(x.id)! - positions.get(y.id)!)
      .map((note) => note.topic);
    expect(order).toEqual(["A", "B", "C"]);
    const noteA = board.notes.find((note) => note.topic === "A")!;
    expect(noteA).toMatchObject({
      imageWords: "słowa A",
      story: "Opowiadanie A",
      emoji: "🏰⚔️",
      color: "red",
      zoneId: board.zones[0].id,
    });
  });

  it('AC-2: import pliku o nazwie "Historia" przy istniejącej planszy "Historia" nie zmienia istniejącej planszy, a nowa nazywa się "Historia (import)"', async () => {
    const user = userEvent.setup();
    const existing = await prisma.board.create({ data: { name: "Historia" } });
    await prisma.note.create({ data: { boardId: existing.id, topic: "Stara", x: 0, y: 0 } });
    render(<BoardListScreen />);

    await user.upload(
      await screen.findByLabelText("Importuj planszę"),
      asFile(JSON.stringify(boardFile("Historia"))),
    );

    expect(await screen.findByRole("link", { name: /Historia \(import\)/ })).toBeInTheDocument();
    expect(await prisma.board.count()).toBe(2);
    const untouched = await prisma.board.findUniqueOrThrow({
      where: { id: existing.id },
      include: { notes: true },
    });
    expect(untouched.name).toBe("Historia");
    expect(untouched.notes.map((note) => note.topic)).toEqual(["Stara"]);
    expect(await prisma.board.count({ where: { name: "Historia (import)" } })).toBe(1);
  });

  it('AC-3: import pliku, który nie jest eksportem Mnemoboard, nie tworzy planszy i pokazuje komunikat "Plik nie jest poprawnym eksportem Mnemoboard"', async () => {
    const user = userEvent.setup();
    render(<BoardListScreen />);

    await user.upload(
      await screen.findByLabelText("Importuj planszę"),
      asFile(JSON.stringify({ zakupy: ["chleb", "mleko"] })),
    );

    expect(
      await screen.findByText("Plik nie jest poprawnym eksportem Mnemoboard"),
    ).toBeInTheDocument();
    expect(await prisma.board.count()).toBe(0);
  });

  it('AC-4: import pliku większego niż 5 MB nie tworzy planszy i pokazuje komunikat "Plik jest za duży (limit 5 MB)"', async () => {
    const user = userEvent.setup();
    render(<BoardListScreen />);

    await user.upload(
      await screen.findByLabelText("Importuj planszę"),
      asFile("x".repeat(5 * 1024 * 1024 + 1)),
    );

    expect(await screen.findByText("Plik jest za duży (limit 5 MB)")).toBeInTheDocument();
    expect(await prisma.board.count()).toBe(0);
  });

  it("API: plik większy niż 5 MB daje 413 FILE_TOO_LARGE bez zapisu", async () => {
    const response = await postImport(JSON.stringify({ pad: "x".repeat(5 * 1024 * 1024 + 1) }));

    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ code: "FILE_TOO_LARGE" });
    expect(await prisma.board.count()).toBe(0);
  });

  it("API: niepoprawny JSON, zły rodzaj pliku (kopia) i niespójne powiązania dają 400 INVALID_EXPORT_FILE bez zapisu", async () => {
    const valid = boardFile();
    const brokenLink = structuredClone(valid);
    brokenLink.board.connections.push({
      sourceNoteId: valid.board.notes[0].id,
      targetNoteId: randomUUID(),
      kind: "association",
    });

    for (const body of [
      "{ nie json",
      JSON.stringify({ ...valid, kind: "backup", boards: [], pegWords: [] }),
      JSON.stringify(brokenLink),
    ]) {
      const response = await postImport(body);
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ code: "INVALID_EXPORT_FILE" });
    }
    expect(await prisma.board.count()).toBe(0);
  });

  it("API: ponowny import tego samego pliku tworzy kolejne plansze z unikalnymi nazwami i nowymi identyfikatorami", async () => {
    const file = boardFile("Historia");
    const body = JSON.stringify(file);

    for (let i = 0; i < 3; i++) expect((await postImport(body)).status).toBe(201);

    const names = (await prisma.board.findMany({ orderBy: { createdAt: "asc" } })).map(
      (board) => board.name,
    );
    expect(names).toEqual(["Historia", "Historia (import)", "Historia (import 2)"]);
    const noteIds = new Set((await prisma.note.findMany()).map((note) => note.id));
    expect(noteIds.size).toBe(9);
    for (const note of file.board.notes) expect(noteIds.has(note.id)).toBe(false);
  });

  it("API: nazwa planszy o maksymalnej długości po dopisku nadal mieści się w 100 znakach", async () => {
    const name = "N".repeat(100);
    await prisma.board.create({ data: { name } });

    const response = await postImport(JSON.stringify(boardFile(name)));

    expect(response.status).toBe(201);
    const created = await response.json();
    expect(created.name).toHaveLength(100);
    expect(created.name.endsWith(" (import)")).toBe(true);
  });

  it("odrzucony plik nie zostawia nawet częściowych danych (karteczek bez planszy)", async () => {
    const invalid = boardFile();
    invalid.board.notes[0].emoji = "🏰⚔️🐉👑🛡️🗡️🏹🎯🔥";

    const response = await postImport(JSON.stringify(invalid));

    expect(response.status).toBe(400);
    await waitFor(async () => expect(await prisma.note.count()).toBe(0));
    expect(await prisma.zone.count()).toBe(0);
  });
});
