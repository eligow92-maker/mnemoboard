import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewScreen } from "@/components/review/review-screen";
import { prisma } from "@/lib/db";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { resetDb } from "../helpers/db";

describe("TASK-018 US-012 Zakres i kolejność powtórki", () => {
  let boardId: string;
  let day = 0;

  // Każda kolejna karteczka ma późniejszą datę utworzenia.
  const createNote = (topic: string, imageWords: string | null, zoneId?: string) =>
    prisma.note.create({
      data: {
        boardId,
        topic,
        imageWords,
        zoneId,
        x: 0,
        y: 0,
        createdAt: new Date(Date.UTC(2026, 0, ++day)),
      },
    });

  const chainLink = (source: { id: string }, target: { id: string }) =>
    prisma.connection.create({
      data: { boardId, sourceNoteId: source.id, targetNoteId: target.id, kind: "chain" },
    });

  // Przechodzi całą powtórkę i zwraca zagadnienia w kolejności ich pojawiania się.
  async function topicsInReviewOrder(): Promise<string[]> {
    const user = userEvent.setup();
    const topics: string[] = [];
    await screen.findByRole("button", { name: "Odsłoń" });
    while (screen.queryByRole("region", { name: "Podsumowanie" }) === null) {
      topics.push((await screen.findByTestId("review-topic")).textContent ?? "");
      await user.click(await screen.findByRole("button", { name: "Odsłoń" }));
      await user.click(screen.getByRole("button", { name: "Pamiętałem" }));
      await screen.findByText(new RegExp(`Karta ${topics.length + 1} z|Koniec powtórki`));
    }
    return topics;
  }

  beforeEach(async () => {
    await resetDb();
    installApiFetch();
    day = 0;
    boardId = (await prisma.board.create({ data: { name: "Historia Polski" } })).id;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-1: w powtórce planszy z łańcuchem A→B→C karteczki pojawiają się w kolejności A, B, C", async () => {
    // Daty utworzenia są odwrotne do kolejności łańcucha, a luźna karteczka jest najstarsza.
    await createNote("Luźna", "luz");
    const c = await createNote("C", "ce");
    const b = await createNote("B", "be");
    const a = await createNote("A", "a");
    await chainLink(b, c);
    await chainLink(a, b);

    render(<ReviewScreen boardId={boardId} />);

    expect(await topicsInReviewOrder()).toEqual(["A", "B", "C", "Luźna"]);
  });

  it("AC-2: karteczka bez słów-obrazów nie pojawia się w powtórce", async () => {
    await createNote("1410", "tor, tuz");
    await createNote("Bez słów", null);
    await createNote("Same spacje", "   ");
    await createNote("966", "boja, jeż");

    render(<ReviewScreen boardId={boardId} />);

    expect(await screen.findByText("Karta 1 z 2")).toBeInTheDocument();
    expect(await topicsInReviewOrder()).toEqual(["1410", "966"]);
  });

  it('AC-3: dla planszy bez żadnych słów-obrazów powtórka się nie rozpoczyna i widać komunikat "Dodaj słowa-obrazy, aby rozpocząć powtórkę"', async () => {
    await createNote("1410", null);
    await createNote("966", null);

    render(<ReviewScreen boardId={boardId} />);

    expect(
      await screen.findByText("Dodaj słowa-obrazy, aby rozpocząć powtórkę"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Odsłoń" })).not.toBeInTheDocument();
    expect(screen.queryByText("1410")).not.toBeInTheDocument();
    expect(await prisma.reviewSession.count()).toBe(0);
  });

  it('AC-4: po wybraniu "Odsłoń" dla karteczki z pokoju "Kuchnia" obok słów-obrazów widać nazwę pokoju "Kuchnia"', async () => {
    const user = userEvent.setup();
    const kitchen = await prisma.zone.create({
      data: { boardId, name: "Kuchnia", x: 0, y: 0, width: 300, height: 300 },
    });
    await createNote("1410", "tor, tuz", kitchen.id);
    render(<ReviewScreen boardId={boardId} />);

    await screen.findByRole("button", { name: "Odsłoń" });
    expect(screen.queryByText("Kuchnia")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Odsłoń" }));

    expect(screen.getByText("tor, tuz")).toBeInTheDocument();
    expect(screen.getByLabelText("Pokój: Kuchnia")).toHaveTextContent("Kuchnia");
  });

  it("POST review-sessions zwraca 422 NO_REVIEWABLE_NOTES dla pustej planszy i nie zakłada sesji", async () => {
    const response = await apiFetch(`/api/boards/${boardId}/review-sessions`, { method: "POST" });

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ code: "NO_REVIEWABLE_NOTES" });
    expect(await prisma.reviewSession.count()).toBe(0);
  });
});
