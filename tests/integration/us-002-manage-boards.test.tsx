import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardListScreen } from "@/components/boards/board-list-screen";
import { prisma } from "@/lib/db";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { resetDb } from "../helpers/db";

describe("TASK-020 US-002 Zarządzanie planszami", () => {
  // Plansza z pełną zawartością: karteczki, połączenie, strefa, ukończona powtórka z wynikiem.
  async function createFullBoard(name: string) {
    const board = await prisma.board.create({ data: { name } });
    const zone = await prisma.zone.create({
      data: { boardId: board.id, name: "Kuchnia", x: 0, y: 0, width: 300, height: 300 },
    });
    const a = await prisma.note.create({
      data: { boardId: board.id, zoneId: zone.id, topic: "A", imageWords: "a", x: 10, y: 10 },
    });
    const b = await prisma.note.create({ data: { boardId: board.id, topic: "B", x: 500, y: 10 } });
    await prisma.connection.create({
      data: { boardId: board.id, sourceNoteId: a.id, targetNoteId: b.id },
    });
    const session = await prisma.reviewSession.create({
      data: { boardId: board.id, finishedAt: new Date() },
    });
    await prisma.reviewResult.create({
      data: { sessionId: session.id, noteId: a.id, remembered: true },
    });
    return board;
  }

  async function findCard(name: string): Promise<HTMLElement> {
    const link = await screen.findByRole("link", { name: new RegExp(name) });
    return link.closest("li") as HTMLElement;
  }

  beforeEach(async () => {
    await resetDb();
    installApiFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('AC-1: po zmianie nazwy planszy "Historia" na "Historia Polski" na liście plansz widnieje nowa nazwa', async () => {
    const user = userEvent.setup();
    const board = await prisma.board.create({ data: { name: "Historia" } });
    render(<BoardListScreen />);

    const card = await findCard("Historia");
    await user.click(within(card).getByRole("button", { name: "Zmień nazwę" }));
    const input = within(card).getByLabelText("Nazwa planszy");
    await user.clear(input);
    await user.type(input, "Historia Polski");
    await user.click(within(card).getByRole("button", { name: "Zapisz" }));

    expect(await screen.findByRole("link", { name: /Historia Polski/ })).toBeInTheDocument();
    expect((await prisma.board.findUniqueOrThrow({ where: { id: board.id } })).name).toBe(
      "Historia Polski",
    );
  });

  it("AC-2: wybranie usunięcia planszy z karteczkami pokazuje pytanie o potwierdzenie przed usunięciem", async () => {
    const user = userEvent.setup();
    const board = await createFullBoard("Historia");
    render(<BoardListScreen />);

    await user.click(within(await findCard("Historia")).getByRole("button", { name: "Usuń" }));

    const dialog = await screen.findByRole("dialog", { name: "Usunąć planszę?" });
    expect(dialog).toHaveTextContent("Historia");
    expect(await prisma.board.count({ where: { id: board.id } })).toBe(1);
    expect(await prisma.note.count()).toBe(2);

    await user.click(within(dialog).getByRole("button", { name: "Anuluj" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await prisma.board.count()).toBe(1);
  });

  it("AC-3: po potwierdzonym usunięciu planszy nie istnieje ona ani jej karteczki, połączenia, strefy i wyniki powtórek", async () => {
    const user = userEvent.setup();
    await createFullBoard("Historia");
    const kept = await prisma.board.create({ data: { name: "Biologia" } });
    await prisma.note.create({ data: { boardId: kept.id, topic: "Zostaje", x: 0, y: 0 } });
    const first = render(<BoardListScreen />);

    await user.click(within(await findCard("Historia")).getByRole("button", { name: "Usuń" }));
    const dialog = await screen.findByRole("dialog", { name: "Usunąć planszę?" });
    await user.click(within(dialog).getByRole("button", { name: "Usuń planszę" }));

    await waitFor(() =>
      expect(screen.queryByRole("link", { name: /Historia/ })).not.toBeInTheDocument(),
    );
    // Powrót do listy = ponowne otwarcie ekranu.
    first.unmount();
    render(<BoardListScreen />);
    expect(await screen.findByRole("link", { name: /Biologia/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Historia/ })).not.toBeInTheDocument();
    expect(await prisma.board.findMany({ select: { name: true } })).toEqual([{ name: "Biologia" }]);
    expect(await prisma.note.findMany({ select: { topic: true } })).toEqual([{ topic: "Zostaje" }]);
    expect(await prisma.connection.count()).toBe(0);
    expect(await prisma.zone.count()).toBe(0);
    expect(await prisma.reviewSession.count()).toBe(0);
    expect(await prisma.reviewResult.count()).toBe(0);
  });

  it("PATCH/DELETE /api/boards/{id}: walidacja nazwy i 404", async () => {
    const board = await prisma.board.create({ data: { name: "Historia" } });
    const patch = (id: string, name: string) =>
      apiFetch(`/api/boards/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
    const missing = "00000000-0000-4000-8000-000000000000";

    expect((await patch(board.id, " ")).status).toBe(400);
    expect((await patch(missing, "Nowa")).status).toBe(404);
    const renamed = await patch(board.id, " Historia Polski ");
    expect(renamed.status).toBe(200);
    expect(await renamed.json()).toMatchObject({ id: board.id, name: "Historia Polski" });
    expect((await apiFetch(`/api/boards/${missing}`, { method: "DELETE" })).status).toBe(404);
    expect((await apiFetch(`/api/boards/${board.id}`, { method: "DELETE" })).status).toBe(204);
  });
});
