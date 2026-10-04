import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import type { BoardDetailDto } from "@/lib/api-types";
import { prisma } from "@/lib/db";
import { apiFetch, apiJson, installApiFetch } from "../helpers/api-fetch";
import { clickNote, getNoteNode, nodePosition } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { dragElement, mockReactFlow } from "../helpers/react-flow";

describe("TASK-007 US-004 Przesuwanie, edycja i usuwanie karteczki", () => {
  let boardId: string;

  async function createNote(topic: string, x = 100, y = 100) {
    return prisma.note.create({ data: { boardId, topic, x, y } });
  }

  beforeAll(() => {
    mockReactFlow();
  });

  beforeEach(async () => {
    await resetDb();
    installApiFetch();
    boardId = (await prisma.board.create({ data: { name: "Historia Polski" } })).id;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('AC-2: po zmianie zagadnienia z "1410" na "15.07.1410" karteczka pokazuje nowe zagadnienie', async () => {
    const user = userEvent.setup();
    const note = await createNote("1410");
    render(<BoardEditorScreen boardId={boardId} />);

    await clickNote(note.id);
    const topic = await screen.findByLabelText("Zagadnienie");
    expect(topic).toHaveValue("1410");
    await user.clear(topic);
    await user.type(topic, "15.07.1410");
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    await waitFor(() => expect(getNoteNode(note.id)).toHaveTextContent("15.07.1410"));
    expect((await prisma.note.findUniqueOrThrow({ where: { id: note.id } })).topic).toBe(
      "15.07.1410",
    );
  });

  it("AC-3: usunięcie karteczki mającej połączenia usuwa z planszy karteczkę i wszystkie jej połączenia", async () => {
    const user = userEvent.setup();
    const [a, b, c] = [
      await createNote("A"),
      await createNote("B", 400, 100),
      await createNote("C", 100, 400),
    ];
    await prisma.connection.createMany({
      data: [
        { boardId, sourceNoteId: a.id, targetNoteId: b.id },
        { boardId, sourceNoteId: c.id, targetNoteId: a.id },
        { boardId, sourceNoteId: b.id, targetNoteId: c.id },
      ],
    });
    render(<BoardEditorScreen boardId={boardId} />);

    await clickNote(a.id);
    await user.click(await screen.findByRole("button", { name: "Usuń karteczkę" }));

    await waitFor(() => expect(screen.queryByTestId(`rf__node-${a.id}`)).not.toBeInTheDocument());
    expect(getNoteNode(b.id)).toBeInTheDocument();
    const board = await apiJson<BoardDetailDto>(`/api/boards/${boardId}`);
    expect(board.notes.map((note) => note.topic)).toEqual(["B", "C"]);
    expect(board.connections).toMatchObject([{ sourceNoteId: b.id, targetNoteId: c.id }]);
  });

  it("upuszczenie przeciągniętej karteczki zapisuje jej nowe położenie", async () => {
    const note = await createNote("1410", 100, 100);
    render(<BoardEditorScreen boardId={boardId} />);

    dragElement(await waitFor(() => getNoteNode(note.id)), { x: 110, y: 110 }, { x: 210, y: 160 });

    await waitFor(async () =>
      expect(await prisma.note.findUniqueOrThrow({ where: { id: note.id } })).toMatchObject({
        x: 200,
        y: 150,
      }),
    );
    expect(nodePosition(getNoteNode(note.id))).toEqual({ x: 200, y: 150 });
  });

  it("PATCH /api/notes/{id}: 400 dla pustej zmiany i pustego zagadnienia, 404 dla nieistniejącej karteczki", async () => {
    const note = await createNote("1410");
    const patch = (id: string, body: unknown) =>
      apiFetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

    expect((await patch(note.id, {})).status).toBe(400);
    expect((await patch(note.id, { topic: " " })).status).toBe(400);
    expect((await patch("00000000-0000-4000-8000-000000000000", { topic: "x" })).status).toBe(404);
    expect(
      (await apiFetch("/api/notes/00000000-0000-4000-8000-000000000000", { method: "DELETE" }))
        .status,
    ).toBe(404);
  });
});
