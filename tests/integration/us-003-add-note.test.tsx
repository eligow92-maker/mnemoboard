import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import { prisma } from "@/lib/db";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { clickPane, getNoteNode, nodePosition, NOTE_HEIGHT, NOTE_WIDTH } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { mockReactFlow } from "../helpers/react-flow";

const TOPIC = "1410 – bitwa pod Grunwaldem";

async function addNoteAt(container: HTMLElement, x: number, y: number, topic: string) {
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Dodaj karteczkę" }));
  clickPane(container, x, y);
  if (topic !== "") await user.type(await screen.findByLabelText("Zagadnienie"), topic);
  await user.click(screen.getByRole("button", { name: "Zapisz" }));
}

describe("TASK-006 US-003 Przyklejenie karteczki do planszy", () => {
  let boardId: string;

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

  it('AC-1: karteczka dodana z zagadnieniem "1410 – bitwa pod Grunwaldem" w wybranym miejscu jest widoczna w tym miejscu z tym zagadnieniem', async () => {
    const { container } = render(<BoardEditorScreen boardId={boardId} />);

    await addNoteAt(container, 400, 300, TOPIC);

    const note = await waitFor(async () => prisma.note.findFirstOrThrow());
    const node = await waitFor(() => getNoteNode(note.id));
    expect(node).toHaveTextContent(TOPIC);
    // Wskazany punkt jest środkiem karteczki.
    expect(nodePosition(node)).toEqual({ x: 400 - NOTE_WIDTH / 2, y: 300 - NOTE_HEIGHT / 2 });
  });

  it('AC-2: zatwierdzenie pustego zagadnienia nie tworzy karteczki i pokazuje komunikat "Wpisz zagadnienie"', async () => {
    const { container } = render(<BoardEditorScreen boardId={boardId} />);

    await addNoteAt(container, 400, 300, "");

    expect(await screen.findByText("Wpisz zagadnienie")).toBeInTheDocument();
    expect(await prisma.note.count()).toBe(0);
  });

  it("AC-3: po odświeżeniu strony dodana karteczka ma to samo zagadnienie i to samo położenie", async () => {
    const first = render(<BoardEditorScreen boardId={boardId} />);
    await addNoteAt(first.container, 250, 120, TOPIC);
    const note = await waitFor(async () => prisma.note.findFirstOrThrow());
    const before = nodePosition(await waitFor(() => getNoteNode(note.id)));
    first.unmount();

    render(<BoardEditorScreen boardId={boardId} />);

    const node = await waitFor(() => getNoteNode(note.id));
    expect(node).toHaveTextContent(TOPIC);
    expect(nodePosition(node)).toEqual(before);
  });

  it("pokazuje nazwę planszy, a dla nieistniejącej planszy komunikat", async () => {
    const existing = render(<BoardEditorScreen boardId={boardId} />);
    expect(await screen.findByRole("heading", { name: "Historia Polski" })).toBeInTheDocument();
    existing.unmount();

    render(<BoardEditorScreen boardId="00000000-0000-4000-8000-000000000000" />);
    expect(await screen.findByText("Plansza nie istnieje")).toBeInTheDocument();
  });

  it("GET /api/boards/{id}: 404 dla nieistniejącej planszy, 400 dla złego identyfikatora", async () => {
    expect((await apiFetch("/api/boards/00000000-0000-4000-8000-000000000000")).status).toBe(404);
    const invalid = await apiFetch("/api/boards/abc");
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("POST /api/boards/{id}/notes odrzuca zagadnienie dłuższe niż 500 znaków i brak położenia", async () => {
    const post = (body: unknown) =>
      apiFetch(`/api/boards/${boardId}/notes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

    expect((await post({ topic: "a".repeat(501), x: 0, y: 0 })).status).toBe(400);
    expect((await post({ topic: "1410" })).status).toBe(400);
    const created = await post({ topic: " 1410 ", x: 1.5, y: -2 });
    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({
      boardId,
      topic: "1410",
      imageWords: null,
      x: 1.5,
      y: -2,
      zoneId: null,
      chainPosition: null,
    });
  });
});
