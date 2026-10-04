import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardListScreen } from "@/components/boards/board-list-screen";
import { prisma } from "@/lib/db";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { resetDb } from "../helpers/db";
import { routerMock } from "../helpers/navigation";

describe("TASK-005 US-001 Utworzenie pierwszej planszy", () => {
  beforeEach(async () => {
    await resetDb();
    installApiFetch();
    routerMock.push.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('AC-1: bez żadnej planszy aplikacja pokazuje pusty stan z komunikatem i przyciskiem "Utwórz pierwszą planszę"', async () => {
    render(<BoardListScreen />);

    expect(await screen.findByText("Nie masz jeszcze żadnej planszy")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Utwórz pierwszą planszę" })).toBeInTheDocument();
  });

  it('AC-2: utworzona plansza "Historia Polski" pojawia się na liście i otwiera się jako pusta', async () => {
    const user = userEvent.setup();
    render(<BoardListScreen />);

    await user.click(await screen.findByRole("button", { name: "Utwórz pierwszą planszę" }));
    await user.type(screen.getByLabelText("Nazwa planszy"), "Historia Polski");
    await user.click(screen.getByRole("button", { name: "Utwórz" }));

    const link = await screen.findByRole("link", { name: /Historia Polski/ });
    const board = await prisma.board.findFirstOrThrow({ include: { notes: true } });
    expect(link).toHaveAttribute("href", `/boards/${board.id}`);
    expect(link).toHaveTextContent("0 karteczek");
    expect(routerMock.push).toHaveBeenCalledWith(`/boards/${board.id}`);
    expect(board.notes).toEqual([]);
  });

  it('AC-3: zatwierdzenie pustej nazwy nie tworzy planszy i pokazuje komunikat "Podaj nazwę planszy"', async () => {
    const user = userEvent.setup();
    render(<BoardListScreen />);

    await user.click(await screen.findByRole("button", { name: "Utwórz pierwszą planszę" }));
    await user.type(screen.getByLabelText("Nazwa planszy"), "   ");
    await user.click(screen.getByRole("button", { name: "Utwórz" }));

    expect(await screen.findByText("Podaj nazwę planszy")).toBeInTheDocument();
    expect(await prisma.board.count()).toBe(0);
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("POST /api/boards odrzuca pustą nazwę i nazwę dłuższą niż 100 znaków", async () => {
    const post = (name: string) =>
      apiFetch("/api/boards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });

    const empty = await post("  ");
    expect(empty.status).toBe(400);
    expect(await empty.json()).toMatchObject({
      code: "VALIDATION_ERROR",
      fields: { name: "Podaj nazwę planszy" },
    });
    expect((await post("a".repeat(101))).status).toBe(400);
    expect(await prisma.board.count()).toBe(0);
  });

  it("GET /api/boards zwraca plansze od najnowszej z liczbą karteczek", async () => {
    const older = await prisma.board.create({
      data: { name: "Biologia", createdAt: new Date("2026-01-01T10:00:00Z") },
    });
    await prisma.board.create({ data: { name: "Historia" } });
    await prisma.note.create({ data: { boardId: older.id, topic: "Mitochondrium", x: 0, y: 0 } });

    const response = await apiFetch("/api/boards");

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject([
      { name: "Historia", noteCount: 0, lastReview: null },
      { name: "Biologia", noteCount: 1, lastReview: null },
    ]);
  });
});
