import { randomUUID } from "node:crypto";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import { prisma } from "@/lib/db";
import type { BackupFile, BoardExportFile } from "@/modules/transfer/schema";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { getNoteNode } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { mockReactFlow } from "../helpers/react-flow";

const NOW = "2026-10-04T12:00:00.000Z";
const SCRIPT = "<script>alert(1)</script>";

type Content = BoardExportFile["board"];

// Plansza: 20 stref, `noteCount` karteczek, 150-ogniwowy łańcuch (149 ogniw) i linie mapy myśli.
function boardContent(name: string, noteCount = 200, connectionCount = 200): Content {
  const zones = Array.from({ length: 20 }, (_, index) => ({
    id: randomUUID(),
    name: `Pokój ${index + 1}`,
    x: (index % 5) * 1000,
    y: Math.floor(index / 5) * 800,
    width: 900,
    height: 700,
    createdAt: NOW,
  }));
  const notes = Array.from({ length: noteCount }, (_, index) => ({
    id: randomUUID(),
    zoneId: zones[index % zones.length].id,
    topic: `Karteczka ${index + 1}`,
    imageWords: `słowa ${index + 1}`,
    story: "Opowiadanie",
    emoji: "🏰",
    color: "yellow" as const,
    x: (index % 20) * 200,
    y: Math.floor(index / 20) * 120,
    createdAt: NOW,
  }));
  const connections: Content["connections"] = [];
  for (let i = 0; i < 149 && connections.length < connectionCount; i++) {
    connections.push({
      sourceNoteId: notes[i].id,
      targetNoteId: notes[i + 1].id,
      kind: "chain",
    });
  }
  for (let i = 0; connections.length < connectionCount; i++) {
    connections.push({
      sourceNoteId: notes[i].id,
      targetNoteId: notes[i + 2].id,
      kind: "association",
    });
  }
  return { name, createdAt: NOW, notes, zones, connections };
}

const post = (path: string, body: unknown) =>
  apiFetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const boardFile = (content: Content): BoardExportFile => ({
  format: "mnemoboard",
  version: 1,
  kind: "board",
  exportedAt: NOW,
  board: content,
});

describe("TASK-037 Wydajność i bezpieczeństwo plików", () => {
  beforeAll(() => {
    mockReactFlow();
  });

  beforeEach(async () => {
    await resetDb();
    installApiFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-1: import pliku eksportu planszy z 200 karteczkami, 20 strefami i 200 połączeniami przez API trwa krócej niż 2 s", async () => {
    const file = boardFile(boardContent("Duża plansza"));

    const started = performance.now();
    const response = await post("/api/boards/import", file);
    const elapsed = performance.now() - started;

    expect(response.status).toBe(201);
    expect(elapsed).toBeLessThan(2000);
    const board = await prisma.board.findFirstOrThrow({
      include: { _count: { select: { notes: true, zones: true, connections: true } } },
    });
    expect(board._count).toEqual({ notes: 200, zones: 20, connections: 200 });
  });

  it("AC-2: przywrócenie pliku kopii z 50 planszami po 200 karteczek przez API trwa krócej niż 10 s", async () => {
    const file: BackupFile = {
      format: "mnemoboard",
      version: 1,
      kind: "backup",
      exportedAt: NOW,
      boards: Array.from({ length: 50 }, (_, index) => ({
        ...boardContent(`Plansza ${index + 1}`),
        reviewSessions: [],
      })),
      pegWords: [],
    };

    const started = performance.now();
    const response = await post("/api/backup/restore", file);
    const elapsed = performance.now() - started;

    expect(response.status).toBe(200);
    expect(elapsed).toBeLessThan(10_000);
    expect(await prisma.board.count()).toBe(50);
    expect(await prisma.note.count()).toBe(10_000);
  }, 60_000);

  it("AC-3: zagadnienie `<script>alert(1)</script>` z importowanego pliku jest widoczne jako tekst i nie tworzy elementu script", async () => {
    const content = boardContent("Plansza z kodem", 1, 0);
    content.notes[0].topic = SCRIPT;
    content.notes[0].story = `<img src=x onerror="alert(2)">`;
    expect((await post("/api/boards/import", boardFile(content))).status).toBe(201);
    const board = await prisma.board.findFirstOrThrow({ include: { notes: true } });

    const { container } = render(<BoardEditorScreen boardId={board.id} />);

    const node = await waitFor(() => getNoteNode(board.notes[0].id));
    expect(node).toHaveTextContent(SCRIPT);
    expect(screen.getByText(SCRIPT)).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("plik z obiema stronami: zagadnienie ze znacznikami nie psuje eksportu i ponownego importu", async () => {
    const content = boardContent("Znaczniki", 1, 0);
    content.notes[0].topic = SCRIPT;
    await post("/api/boards/import", boardFile(content));
    const board = await prisma.board.findFirstOrThrow();

    const exported = await (await apiFetch(`/api/boards/${board.id}/export`)).json();
    const again = await post("/api/boards/import", exported);

    expect(again.status).toBe(201);
    expect(await prisma.note.count({ where: { topic: SCRIPT } })).toBe(2);
  });
});
