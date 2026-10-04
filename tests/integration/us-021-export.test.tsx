import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardListScreen } from "@/components/boards/board-list-screen";
import { prisma } from "@/lib/db";
import { parseBoardExportFile } from "@/modules/transfer/format";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { resetDb } from "../helpers/db";

describe("TASK-033 US-021 Eksport planszy", () => {
  // Plansza z 3 karteczkami, 1 strefą i 2 połączeniami (w tym ogniwo łańcucha).
  async function createBoardToExport(name: string) {
    const board = await prisma.board.create({ data: { name } });
    const zone = await prisma.zone.create({
      data: { boardId: board.id, name: "Kuchnia", x: 0, y: 0, width: 300, height: 300 },
    });
    const a = await prisma.note.create({
      data: {
        boardId: board.id,
        zoneId: zone.id,
        topic: "1410",
        imageWords: "tor, dos",
        story: "Po torze jedzie dos",
        emoji: "🏰⚔️",
        color: "red",
        x: 10,
        y: 20,
        createdAt: new Date(Date.UTC(2026, 0, 1)),
      },
    });
    const b = await prisma.note.create({
      data: {
        boardId: board.id,
        topic: "966",
        x: 500,
        y: 10,
        createdAt: new Date(Date.UTC(2026, 0, 2)),
      },
    });
    const c = await prisma.note.create({
      data: {
        boardId: board.id,
        topic: "Mitochondrium",
        color: "blue",
        x: 900,
        y: 10,
        createdAt: new Date(Date.UTC(2026, 0, 3)),
      },
    });
    await prisma.connection.create({
      data: { boardId: board.id, sourceNoteId: a.id, targetNoteId: b.id },
    });
    await prisma.connection.create({
      data: { boardId: board.id, sourceNoteId: b.id, targetNoteId: c.id, kind: "chain" },
    });
    return board;
  }

  beforeEach(async () => {
    await resetDb();
    installApiFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('AC-1: wybranie "Eksportuj" dla planszy "Historia Polski" pobiera plik JSON, którego nazwa zawiera "historia-polski"', async () => {
    const user = userEvent.setup();
    await createBoardToExport("Historia Polski");
    const blobs: Blob[] = [];
    vi.stubGlobal(
      "URL",
      Object.assign(URL, {
        createObjectURL: (blob: Blob) => {
          blobs.push(blob);
          return "blob:test";
        },
        revokeObjectURL: () => undefined,
      }),
    );
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads.push(this.download);
    });
    render(<BoardListScreen />);

    const card = (await screen.findByRole("link", { name: /Historia Polski/ })).closest(
      "li",
    ) as HTMLElement;
    await user.click(within(card).getByRole("button", { name: "Eksportuj" }));

    await waitFor(() => expect(downloads).toHaveLength(1));
    expect(downloads[0]).toContain("historia-polski");
    expect(downloads[0]).toMatch(/\.json$/);
    expect(JSON.parse(await blobs[0].text())).toMatchObject({
      format: "mnemoboard",
      kind: "board",
    });
  });

  it("AC-2: eksport planszy z 3 karteczkami, 1 strefą i 2 połączeniami zawiera 3 karteczki z zagadnieniem, słowami-obrazami, opowiadaniem, emotkami, kolorem i położeniem, 1 strefę i 2 połączenia", async () => {
    const board = await createBoardToExport("Historia Polski");

    const response = await apiFetch(`/api/boards/${board.id}/export`);

    expect(response.status).toBe(200);
    const parsed = parseBoardExportFile(await response.json());
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const { notes, zones, connections } = parsed.data.board;
    expect(notes).toHaveLength(3);
    expect(zones).toHaveLength(1);
    expect(connections).toHaveLength(2);
    expect(notes[0]).toMatchObject({
      topic: "1410",
      imageWords: "tor, dos",
      story: "Po torze jedzie dos",
      emoji: "🏰⚔️",
      color: "red",
      x: 10,
      y: 20,
    });
    expect(notes[2]).toMatchObject({ topic: "Mitochondrium", color: "blue" });
    expect(connections.map((connection) => connection.kind).sort()).toEqual([
      "association",
      "chain",
    ]);
  });

  it("odpowiedź ma nagłówek załącznika z nazwą pliku i nie zawiera historii powtórek", async () => {
    const board = await createBoardToExport("Żółta Historia");
    const session = await prisma.reviewSession.create({
      data: { boardId: board.id, finishedAt: new Date() },
    });
    const note = await prisma.note.findFirstOrThrow({ where: { boardId: board.id } });
    await prisma.reviewResult.create({
      data: { sessionId: session.id, noteId: note.id, remembered: true },
    });

    const response = await apiFetch(`/api/boards/${board.id}/export`);

    expect(response.headers.get("content-disposition")).toMatch(
      /^attachment; filename="mnemoboard-zolta-historia-\d{4}-\d{2}-\d{2}\.json"$/,
    );
    const body = await response.text();
    expect(body).not.toContain("reviewSessions");
    expect(body).not.toContain(board.id);
  });

  it("eksport nieistniejącej planszy zwraca 404", async () => {
    const response = await apiFetch("/api/boards/00000000-0000-4000-8000-000000000000/export");

    expect(response.status).toBe(404);
  });
});
