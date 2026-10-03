import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import { prisma } from "@/lib/db";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { getNoteNode } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { mockReactFlow } from "../helpers/react-flow";

describe("TASK-012 US-008 Połączenia mapy myśli", () => {
  let boardId: string;
  let a: { id: string };
  let b: { id: string };

  async function connectInEditor(sourceId: string, targetId: string) {
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Połącz karteczki" }));
    await user.click(getNoteNode(sourceId));
    await user.click(getNoteNode(targetId));
  }

  beforeAll(() => {
    mockReactFlow();
  });

  beforeEach(async () => {
    await resetDb();
    installApiFetch();
    boardId = (await prisma.board.create({ data: { name: "Historia Polski" } })).id;
    a = await prisma.note.create({ data: { boardId, topic: "A", x: 100, y: 100 } });
    b = await prisma.note.create({ data: { boardId, topic: "B", x: 500, y: 100 } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-1: po połączeniu dwóch karteczek i odświeżeniu strony między karteczkami widoczna jest linia", async () => {
    const first = render(<BoardEditorScreen boardId={boardId} />);
    await waitFor(() => getNoteNode(a.id));

    await connectInEditor(a.id, b.id);

    const connection = await waitFor(async () => prisma.connection.findFirstOrThrow());
    expect(connection).toMatchObject({
      sourceNoteId: a.id,
      targetNoteId: b.id,
      kind: "association",
    });
    first.unmount();
    render(<BoardEditorScreen boardId={boardId} />);
    const edge = await screen.findByTestId(`rf__edge-${connection.id}`);
    expect(edge.querySelector("path")).not.toBeNull();
  });

  it("AC-2: ponowne połączenie dwóch już połączonych karteczek nie tworzy drugiego połączenia", async () => {
    await prisma.connection.create({ data: { boardId, sourceNoteId: a.id, targetNoteId: b.id } });
    render(<BoardEditorScreen boardId={boardId} />);
    await waitFor(() => getNoteNode(a.id));

    await connectInEditor(b.id, a.id);

    expect(await screen.findByText("Te karteczki są już połączone")).toBeInTheDocument();
    expect(await prisma.connection.count()).toBe(1);
    expect(screen.getAllByTestId(/^rf__edge-/)).toHaveLength(1);
  });

  it("AC-3: usunięcie połączenia usuwa linię, a obie karteczki pozostają na planszy", async () => {
    const user = userEvent.setup();
    const connection = await prisma.connection.create({
      data: { boardId, sourceNoteId: a.id, targetNoteId: b.id },
    });
    render(<BoardEditorScreen boardId={boardId} />);

    fireEvent.click(await screen.findByTestId(`rf__edge-${connection.id}`));
    await user.click(await screen.findByRole("button", { name: "Usuń połączenie" }));

    await waitFor(() =>
      expect(screen.queryByTestId(`rf__edge-${connection.id}`)).not.toBeInTheDocument(),
    );
    expect(getNoteNode(a.id)).toBeInTheDocument();
    expect(getNoteNode(b.id)).toBeInTheDocument();
    expect(await prisma.connection.count()).toBe(0);
    expect(await prisma.note.count()).toBe(2);
  });

  it("API połączeń: walidacja, 404, 409 CONNECTION_EXISTS i usuwanie", async () => {
    const other = await prisma.board.create({ data: { name: "Inna" } });
    const foreign = await prisma.note.create({
      data: { boardId: other.id, topic: "X", x: 0, y: 0 },
    });
    const post = (body: unknown) =>
      apiFetch(`/api/boards/${boardId}/connections`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    const base = { sourceNoteId: a.id, targetNoteId: b.id, kind: "association" };

    expect((await post({ ...base, kind: "inne" })).status).toBe(400);
    expect((await post({ ...base, targetNoteId: a.id })).status).toBe(400);
    expect((await post({ ...base, targetNoteId: foreign.id })).status).toBe(404);
    const created = await post(base);
    expect(created.status).toBe(201);
    const connection = await created.json();
    expect(connection).toMatchObject({ ...base, boardId });

    const duplicate = await post({ ...base, sourceNoteId: b.id, targetNoteId: a.id });
    expect(duplicate.status).toBe(409);
    expect(await duplicate.json()).toMatchObject({ code: "CONNECTION_EXISTS" });

    const remove = () => apiFetch(`/api/connections/${connection.id}`, { method: "DELETE" });
    expect((await remove()).status).toBe(204);
    expect((await remove()).status).toBe(404);
  });
});
