import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import type { BoardDetailDto } from "@/lib/api-types";
import { prisma } from "@/lib/db";
import { apiFetch, apiJson, installApiFetch } from "../helpers/api-fetch";
import { clickNote, getNoteNode } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { mockReactFlow } from "../helpers/react-flow";

describe("TASK-013 US-009 Łańcuch skojarzeń", () => {
  let boardId: string;
  let a: { id: string };
  let b: { id: string };
  let c: { id: string };

  const chainLink = (source: { id: string }, target: { id: string }) =>
    prisma.connection.create({
      data: { boardId, sourceNoteId: source.id, targetNoteId: target.id, kind: "chain" },
    });

  // W trybie łańcucha kolejne dotknięcia karteczek tworzą kolejne ogniwa.
  async function chainInEditor(...notes: { id: string }[]) {
    const user = userEvent.setup();
    await waitFor(() => getNoteNode(a.id));
    await user.click(screen.getByRole("button", { name: "Połącz w łańcuch" }));
    for (const note of notes) await clickNote(note.id);
  }

  const chainNumber = (note: { id: string }) =>
    within(getNoteNode(note.id)).getByLabelText(/Kolejność w łańcuchu/);

  beforeAll(() => {
    mockReactFlow();
  });

  beforeEach(async () => {
    await resetDb();
    installApiFetch();
    boardId = (await prisma.board.create({ data: { name: "Historia Polski" } })).id;
    a = await prisma.note.create({ data: { boardId, topic: "A", x: 100, y: 100 } });
    b = await prisma.note.create({ data: { boardId, topic: "B", x: 400, y: 100 } });
    c = await prisma.note.create({ data: { boardId, topic: "C", x: 700, y: 100 } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-1: po utworzeniu ogniw łańcucha A→B i B→C karteczki pokazują numery kolejności 1, 2 i 3", async () => {
    render(<BoardEditorScreen boardId={boardId} />);

    await chainInEditor(a, b, c);

    await waitFor(() => expect(chainNumber(c)).toHaveTextContent("3"));
    expect(chainNumber(a)).toHaveTextContent("1");
    expect(chainNumber(b)).toHaveTextContent("2");
    expect(
      await prisma.connection.findMany({
        where: { kind: "chain" },
        orderBy: { createdAt: "asc" },
        select: { sourceNoteId: true, targetNoteId: true },
      }),
    ).toEqual([
      { sourceNoteId: a.id, targetNoteId: b.id },
      { sourceNoteId: b.id, targetNoteId: c.id },
    ]);
  });

  it('AC-2: ogniwo A→C dla karteczki A mającej już ogniwo A→B nie powstaje i pojawia się komunikat "Karteczka ma już następnik w łańcuchu"', async () => {
    await chainLink(a, b);
    render(<BoardEditorScreen boardId={boardId} />);

    await chainInEditor(a, c);

    expect(await screen.findByText("Karteczka ma już następnik w łańcuchu")).toBeInTheDocument();
    expect(await prisma.connection.count()).toBe(1);
  });

  it('AC-3: ogniwo C→A w łańcuchu A→B→C nie powstaje i pojawia się komunikat "Łańcuch nie może tworzyć pętli"', async () => {
    await chainLink(a, b);
    await chainLink(b, c);
    render(<BoardEditorScreen boardId={boardId} />);

    await chainInEditor(c, a);

    expect(await screen.findByText("Łańcuch nie może tworzyć pętli")).toBeInTheDocument();
    expect(await prisma.connection.count()).toBe(2);
  });

  it("API: kody 409 reguł łańcucha i chainPosition w odpowiedzi planszy", async () => {
    await chainLink(a, b);
    const post = (source: { id: string }, target: { id: string }, kind = "chain") =>
      apiFetch(`/api/boards/${boardId}/connections`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sourceNoteId: source.id, targetNoteId: target.id, kind }),
      });
    const code = async (response: Response) => [response.status, (await response.json()).code];

    expect(await code(await post(c, b))).toEqual([409, "CHAIN_PREDECESSOR_EXISTS"]);
    expect(await code(await post(a, c))).toEqual([409, "CHAIN_SUCCESSOR_EXISTS"]);
    // Zamiana linii mapy myśli na ogniwo dla tej samej pary jest odrzucana.
    expect(await code(await post(b, a))).toEqual([409, "CONNECTION_EXISTS"]);
    expect((await post(b, c)).status).toBe(201);
    expect(await code(await post(c, a))).toEqual([409, "CHAIN_CYCLE"]);

    const board = await apiJson<BoardDetailDto>(`/api/boards/${boardId}`);
    expect(board.notes.map((note) => [note.topic, note.chainPosition])).toEqual([
      ["A", 1],
      ["B", 2],
      ["C", 3],
    ]);
  });

  it("usunięcie środkowej karteczki dzieli łańcuch, a numery znikają z pozostałych", async () => {
    const d = await prisma.note.create({ data: { boardId, topic: "D", x: 100, y: 400 } });
    await chainLink(a, b);
    await chainLink(b, c);
    await chainLink(c, d);

    await apiJson(`/api/notes/${b.id}`, "DELETE");

    const board = await apiJson<BoardDetailDto>(`/api/boards/${boardId}`);
    expect(board.notes.map((note) => [note.topic, note.chainPosition])).toEqual([
      ["A", null],
      ["C", 1],
      ["D", 2],
    ]);
  });
});
