import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import { prisma } from "@/lib/db";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { clickNote, clickPane, getNoteNode } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { mockReactFlow } from "../helpers/react-flow";

describe("TASK-027 US-017 Kolory karteczek", () => {
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

  it("AC-1: nowo dodana karteczka ma kolor żółty", async () => {
    const user = userEvent.setup();
    const { container } = render(<BoardEditorScreen boardId={boardId} />);

    await user.click(await screen.findByRole("button", { name: "Dodaj karteczkę" }));
    clickPane(container, 300, 300);
    await user.type(await screen.findByLabelText("Zagadnienie"), "1410");
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    const created = await waitFor(async () => {
      const note = await prisma.note.findFirst();
      expect(note).not.toBeNull();
      return note!;
    });
    expect(created.color).toBe("yellow");
    await waitFor(() => expect(getNoteNode(created.id)).toBeInTheDocument());
    expect(getNoteNode(created.id).querySelector("[data-note-color]")).toHaveAttribute(
      "data-note-color",
      "yellow",
    );
  });

  it("AC-2: wybór koloru karteczki pokazuje dokładnie 5 kolorów: żółty, czerwony, pomarańczowy, zielony i niebieski", async () => {
    const note = await prisma.note.create({ data: { boardId, topic: "1410", x: 100, y: 100 } });
    render(<BoardEditorScreen boardId={boardId} />);

    await clickNote(note.id);
    const picker = await screen.findByRole("radiogroup", { name: "Kolor karteczki" });

    const colors = within(picker)
      .getAllByRole("radio")
      .map((radio) => radio.getAttribute("aria-label"));
    expect(colors).toEqual(["żółty", "czerwony", "pomarańczowy", "zielony", "niebieski"]);
    expect(within(picker).getByRole("radio", { name: "żółty" })).toBeChecked();
  });

  it("AC-3: żółta karteczka zmieniona na czerwoną jest po odświeżeniu strony czerwona", async () => {
    const user = userEvent.setup();
    const note = await prisma.note.create({ data: { boardId, topic: "1410", x: 100, y: 100 } });
    const first = render(<BoardEditorScreen boardId={boardId} />);

    await clickNote(note.id);
    await user.click(await screen.findByRole("radio", { name: "czerwony" }));
    await waitFor(async () =>
      expect((await prisma.note.findUniqueOrThrow({ where: { id: note.id } })).color).toBe("red"),
    );
    first.unmount();
    render(<BoardEditorScreen boardId={boardId} />);

    const node = await waitFor(() => getNoteNode(note.id));
    expect(node.querySelector("[data-note-color]")).toHaveAttribute("data-note-color", "red");
  });

  it("nieznany kolor w żądaniu API jest odrzucany kodem 400", async () => {
    const response = await apiFetch(`/api/boards/${boardId}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic: "1410", color: "purple", x: 0, y: 0 }),
    });

    expect(response.status).toBe(400);
  });

  it("zmiana koloru nie zmienia zagadnienia ani innych pól karteczki", async () => {
    const note = await prisma.note.create({
      data: { boardId, topic: "1410", imageWords: "tor, dos", x: 100, y: 100 },
    });

    const response = await apiFetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ color: "green" }),
    });

    expect(response.status).toBe(200);
    expect(await prisma.note.findUniqueOrThrow({ where: { id: note.id } })).toMatchObject({
      topic: "1410",
      imageWords: "tor, dos",
      color: "green",
    });
  });
});
