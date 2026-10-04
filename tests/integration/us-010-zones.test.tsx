import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import type { BoardDetailDto, NoteDto } from "@/lib/api-types";
import { prisma } from "@/lib/db";
import { apiFetch, apiJson, installApiFetch } from "../helpers/api-fetch";
import { clickPane, getNoteNode } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { dragElement, mockReactFlow } from "../helpers/react-flow";

describe("TASK-015 US-010 Pokoje pałacu pamięci", () => {
  let boardId: string;

  // Strefa 300×300 z lewym górnym rogiem w (300, 300).
  const createKitchen = () =>
    prisma.zone.create({
      data: { boardId, name: "Kuchnia", x: 300, y: 300, width: 300, height: 300 },
    });

  const noteZoneId = async (noteId: string) =>
    (await prisma.note.findUniqueOrThrow({ where: { id: noteId } })).zoneId;

  beforeAll(() => {
    mockReactFlow();
  });

  beforeEach(async () => {
    await resetDb();
    installApiFetch();
    boardId = (await prisma.board.create({ data: { name: "Pałac pamięci" } })).id;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('AC-1: strefa utworzona z nazwą "Kuchnia" jest widoczna na planszy z tą nazwą', async () => {
    const user = userEvent.setup();
    const { container } = render(<BoardEditorScreen boardId={boardId} />);

    await user.click(await screen.findByRole("button", { name: "Dodaj pokój" }));
    clickPane(container, 500, 400);
    await user.type(await screen.findByLabelText("Nazwa pokoju"), "Kuchnia");
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    const zone = await waitFor(async () => prisma.zone.findFirstOrThrow());
    const node = await screen.findByTestId(`rf__node-${zone.id}`);
    expect(node).toHaveTextContent("Kuchnia");
    expect(zone).toMatchObject({ name: "Kuchnia", boardId });
  });

  it('AC-2: karteczka upuszczona w obrębie strefy "Kuchnia" jest przypisana do pokoju "Kuchnia"', async () => {
    const kitchen = await createKitchen();
    const note = await prisma.note.create({ data: { boardId, topic: "A", x: 0, y: 0 } });
    render(<BoardEditorScreen boardId={boardId} />);

    dragElement(await waitFor(() => getNoteNode(note.id)), { x: 10, y: 10 }, { x: 370, y: 360 });

    await waitFor(async () => expect(await noteZoneId(note.id)).toBe(kitchen.id));
    await waitFor(() =>
      expect(within(getNoteNode(note.id)).getByLabelText("Pokój: Kuchnia")).toBeInTheDocument(),
    );
  });

  it('AC-3: karteczka przeciągnięta poza strefę "Kuchnia" nie jest przypisana do żadnego pokoju', async () => {
    const kitchen = await createKitchen();
    const note = await prisma.note.create({
      data: { boardId, topic: "A", x: 360, y: 350, zoneId: kitchen.id },
    });
    render(<BoardEditorScreen boardId={boardId} />);
    const node = await waitFor(() => getNoteNode(note.id));
    expect(within(node).getByLabelText("Pokój: Kuchnia")).toBeInTheDocument();

    dragElement(node, { x: 370, y: 360 }, { x: 10, y: 10 });

    await waitFor(async () => expect(await noteZoneId(note.id)).toBeNull());
    await waitFor(() =>
      expect(within(getNoteNode(note.id)).queryByLabelText(/Pokój:/)).not.toBeInTheDocument(),
    );
  });

  it("AC-4: po usunięciu strefy zawierającej karteczki karteczki pozostają na planszy bez przypisanego pokoju", async () => {
    const user = userEvent.setup();
    const kitchen = await createKitchen();
    const a = await prisma.note.create({
      data: { boardId, topic: "A", x: 320, y: 320, zoneId: kitchen.id },
    });
    const b = await prisma.note.create({
      data: { boardId, topic: "B", x: 380, y: 450, zoneId: kitchen.id },
    });
    render(<BoardEditorScreen boardId={boardId} />);

    fireEvent.click(await screen.findByTestId(`rf__node-${kitchen.id}`));
    await user.click(await screen.findByRole("button", { name: "Usuń pokój" }));

    await waitFor(() =>
      expect(screen.queryByTestId(`rf__node-${kitchen.id}`)).not.toBeInTheDocument(),
    );
    expect(getNoteNode(a.id)).toBeInTheDocument();
    expect(getNoteNode(b.id)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Pokój:/)).not.toBeInTheDocument();
    expect(await noteZoneId(a.id)).toBeNull();
    expect(await noteZoneId(b.id)).toBeNull();
    expect(await prisma.zone.count()).toBe(0);
  });

  it("pusta nazwa pokoju nie tworzy strefy", async () => {
    const user = userEvent.setup();
    const { container } = render(<BoardEditorScreen boardId={boardId} />);

    await user.click(await screen.findByRole("button", { name: "Dodaj pokój" }));
    clickPane(container, 500, 400);
    await user.click(await screen.findByRole("button", { name: "Zapisz" }));

    expect(await screen.findByText("Podaj nazwę pokoju")).toBeInTheDocument();
    expect(await prisma.zone.count()).toBe(0);
  });

  it("API stref: przypisania po utworzeniu, zmianie geometrii i usunięciu nakładającej się strefy", async () => {
    const inside = await apiJson<NoteDto>(`/api/boards/${boardId}/notes`, "POST", {
      topic: "W środku",
      x: 360,
      y: 350,
    });
    const outside = await apiJson<NoteDto>(`/api/boards/${boardId}/notes`, "POST", {
      topic: "Poza",
      x: 0,
      y: 0,
    });

    const older = await apiJson<{ id: string; noteIds: string[] }>(
      `/api/boards/${boardId}/zones`,
      "POST",
      { name: "Kuchnia", x: 300, y: 300, width: 300, height: 300 },
    );
    expect(older.noteIds).toEqual([inside.id]);

    // Karteczka utworzona wewnątrz strefy od razu dostaje pokój.
    const created = await apiJson<NoteDto>(`/api/boards/${boardId}/notes`, "POST", {
      topic: "Nowa",
      x: 250,
      y: 260,
    });
    expect(created.zoneId).toBe(older.id);

    const newer = await apiJson<{ id: string; noteIds: string[] }>(
      `/api/boards/${boardId}/zones`,
      "POST",
      { name: "Spiżarnia", x: 350, y: 340, width: 300, height: 300 },
    );
    expect(newer.noteIds).toEqual([inside.id]);

    // Przesunięcie nowszej strefy nad drugą karteczkę zabiera ją, a pierwsza wraca do starszej.
    const moved = await apiJson<{ noteIds: string[] }>(`/api/zones/${newer.id}`, "PATCH", {
      x: -50,
      y: -50,
    });
    expect(moved.noteIds).toEqual([outside.id]);
    expect(await noteZoneId(inside.id)).toBe(older.id);

    await apiJson(`/api/zones/${newer.id}`, "DELETE");
    expect(await noteZoneId(outside.id)).toBeNull();

    const board = await apiJson<BoardDetailDto>(`/api/boards/${boardId}`);
    expect(board.zones.map((zone) => zone.name)).toEqual(["Kuchnia"]);

    const invalid = await apiFetch(`/api/boards/${boardId}/zones`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Zła", x: 0, y: 0, width: 0, height: 100 }),
    });
    expect(invalid.status).toBe(400);
    expect(
      (await apiFetch("/api/zones/00000000-0000-4000-8000-000000000000", { method: "DELETE" }))
        .status,
    ).toBe(404);
  });
});
