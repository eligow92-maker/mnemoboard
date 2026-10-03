import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardListScreen } from "@/components/boards/board-list-screen";
import type { BoardSummaryDto } from "@/lib/api-types";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { apiJson, installApiFetch } from "../helpers/api-fetch";
import { resetDb } from "../helpers/db";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("TASK-019 US-013 Statystyki zapamiętywania", () => {
  // Zakłada ukończoną (lub nie) powtórkę z podaną liczbą zapamiętanych i wszystkich karteczek.
  async function createSession(
    boardId: string,
    remembered: number,
    total: number,
    finishedAt: Date | null,
  ) {
    const session = await prisma.reviewSession.create({ data: { boardId, finishedAt } });
    for (let index = 0; index < total; index++) {
      const note = await prisma.note.create({
        data: { boardId, topic: `Karteczka ${index}`, imageWords: "słowo", x: 0, y: 0 },
      });
      await prisma.reviewResult.create({
        data: { sessionId: session.id, noteId: note.id, remembered: index < remembered },
      });
    }
    return session;
  }

  const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

  beforeEach(async () => {
    await resetDb();
    installApiFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('AC-1: przy planszy z ukończoną powtórką o wyniku 8 z 10 lista plansz pokazuje wynik ostatniej powtórki "80%" wraz z jej datą', async () => {
    const board = await prisma.board.create({ data: { name: "Historia Polski" } });
    const finishedAt = daysAgo(2);
    await createSession(board.id, 3, 10, daysAgo(5));
    await createSession(board.id, 8, 10, finishedAt);

    render(<BoardListScreen />);

    const card = (await screen.findByRole("link", { name: /Historia Polski/ })).closest("li");
    expect(card).not.toBeNull();
    const lastReview = within(card as HTMLElement).getByText(/Ostatnia powtórka/);
    expect(lastReview).toHaveTextContent("80%");
    expect(lastReview).toHaveTextContent(formatDate(finishedAt.toISOString()));
    expect(lastReview).not.toHaveTextContent("30%");
  });

  it('AC-2: przy 3 ukończonych powtórkach z ostatnich 7 dni statystyki pokazują "Powtórki w ostatnich 7 dniach: 3"', async () => {
    const board = await prisma.board.create({ data: { name: "Historia Polski" } });
    const other = await prisma.board.create({ data: { name: "Biologia" } });
    await createSession(board.id, 1, 1, daysAgo(0));
    await createSession(board.id, 1, 1, daysAgo(3));
    await createSession(other.id, 0, 1, daysAgo(6));
    // Nie liczą się: powtórka sprzed ponad 7 dni i powtórka nieukończona.
    await createSession(board.id, 1, 1, daysAgo(8));
    await createSession(board.id, 1, 1, null);

    render(<BoardListScreen />);

    expect(await screen.findByText("Powtórki w ostatnich 7 dniach: 3")).toBeInTheDocument();
  });

  it('AC-3: przy planszy bez żadnej ukończonej powtórki lista plansz pokazuje "Brak powtórek"', async () => {
    const board = await prisma.board.create({ data: { name: "Historia Polski" } });
    await createSession(board.id, 1, 1, null);

    render(<BoardListScreen />);

    const card = (await screen.findByRole("link", { name: /Historia Polski/ })).closest("li");
    expect(within(card as HTMLElement).getByText("Brak powtórek")).toBeInTheDocument();
    expect(await screen.findByText("Powtórki w ostatnich 7 dniach: 0")).toBeInTheDocument();
  });

  it("GET /api/boards zwraca lastReview z zaokrąglonym procentem, GET /api/stats liczbę powtórek", async () => {
    const board = await prisma.board.create({ data: { name: "Historia Polski" } });
    await prisma.board.create({ data: { name: "Pusta" } });
    const session = await createSession(board.id, 2, 3, daysAgo(1));

    const boards = await apiJson<BoardSummaryDto[]>("/api/boards");
    const summary = boards.find((item) => item.id === board.id);

    expect(summary?.lastReview).toEqual({
      finishedAt: session.finishedAt?.toISOString(),
      rememberedCount: 2,
      totalCount: 3,
      percent: 67,
    });
    expect(boards.find((item) => item.name === "Pusta")?.lastReview).toBeNull();
    expect(await apiJson("/api/stats")).toEqual({ sessionsLast7Days: 1 });
  });
});
