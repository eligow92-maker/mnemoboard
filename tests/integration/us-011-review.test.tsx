import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewScreen } from "@/components/review/review-screen";
import type { ReviewSessionStartDto } from "@/lib/api-types";
import { prisma } from "@/lib/db";
import { apiFetch, apiJson, installApiFetch } from "../helpers/api-fetch";
import { resetDb } from "../helpers/db";

describe("TASK-017 US-011 Przebieg powtórki", () => {
  let boardId: string;

  // Karteczki tworzone po kolei, z rosnącą datą utworzenia.
  async function createNotes(...notes: [topic: string, imageWords: string][]) {
    const created = [];
    for (const [index, [topic, imageWords]] of notes.entries()) {
      created.push(
        await prisma.note.create({
          data: {
            boardId,
            topic,
            imageWords,
            x: 0,
            y: 0,
            createdAt: new Date(Date.UTC(2026, 0, 1 + index)),
          },
        }),
      );
    }
    return created;
  }

  beforeEach(async () => {
    await resetDb();
    installApiFetch();
    boardId = (await prisma.board.create({ data: { name: "Historia Polski" } })).id;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-1: po rozpoczęciu powtórki widać zagadnienie pierwszej karteczki, a jej słowa-obrazy są zakryte", async () => {
    await createNotes(["1410", "tor, tuz"], ["966", "boja, jeż"]);

    render(<ReviewScreen boardId={boardId} />);

    expect(await screen.findByText("1410")).toBeInTheDocument();
    expect(screen.getByText("Karta 1 z 2")).toBeInTheDocument();
    expect(screen.queryByText("tor, tuz")).not.toBeInTheDocument();
    expect(screen.queryByText("966")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pamiętałem" })).not.toBeInTheDocument();
  });

  it('AC-2: po wybraniu "Odsłoń" widać słowa-obrazy oraz przyciski "Pamiętałem" i "Nie pamiętałem"', async () => {
    const user = userEvent.setup();
    await createNotes(["1410", "tor, tuz"]);
    render(<ReviewScreen boardId={boardId} />);

    await user.click(await screen.findByRole("button", { name: "Odsłoń" }));

    expect(screen.getByText("tor, tuz")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pamiętałem" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nie pamiętałem" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Odsłoń" })).not.toBeInTheDocument();
  });

  it('AC-3: wybranie "Pamiętałem" zapisuje wynik z bieżącą datą i pokazuje następną karteczkę', async () => {
    const user = userEvent.setup();
    const [first] = await createNotes(["1410", "tor, tuz"], ["966", "boja, jeż"]);
    render(<ReviewScreen boardId={boardId} />);
    const startedAt = Date.now();

    await user.click(await screen.findByRole("button", { name: "Odsłoń" }));
    await user.click(screen.getByRole("button", { name: "Pamiętałem" }));

    expect(await screen.findByText("966")).toBeInTheDocument();
    expect(screen.getByText("Karta 2 z 2")).toBeInTheDocument();
    expect(screen.queryByText("boja, jeż")).not.toBeInTheDocument();
    const result = await prisma.reviewResult.findFirstOrThrow();
    expect(result).toMatchObject({ noteId: first.id, remembered: true });
    expect(result.answeredAt.getTime()).toBeGreaterThanOrEqual(startedAt - 1000);
    expect(result.answeredAt.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it("AC-4: po ocenieniu ostatniej karteczki widać podsumowanie z liczbą zapamiętanych, liczbą wszystkich i wynikiem procentowym", async () => {
    const user = userEvent.setup();
    await createNotes(["1410", "tor, tuz"], ["966", "boja, jeż"], ["1569", "talia, jeep"]);
    render(<ReviewScreen boardId={boardId} />);

    for (const answer of ["Pamiętałem", "Nie pamiętałem", "Pamiętałem"]) {
      await user.click(await screen.findByRole("button", { name: "Odsłoń" }));
      await user.click(screen.getByRole("button", { name: answer }));
    }

    expect(await screen.findByText("2 z 3")).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Wróć do planszy" })).toHaveAttribute(
      "href",
      `/boards/${boardId}`,
    );
    const session = await prisma.reviewSession.findFirstOrThrow({ include: { results: true } });
    expect(session.finishedAt).not.toBeNull();
    expect(session.results).toHaveLength(3);
  });

  it("API powtórki: RESULT_EXISTS, SESSION_FINISHED, 404 i podsumowanie", async () => {
    const [first, second] = await createNotes(["1410", "tor, tuz"], ["966", "boja, jeż"]);
    const otherBoard = await prisma.board.create({ data: { name: "Inna" } });
    const foreign = await prisma.note.create({
      data: { boardId: otherBoard.id, topic: "X", imageWords: "x", x: 0, y: 0 },
    });
    const session = await apiJson<ReviewSessionStartDto>(
      `/api/boards/${boardId}/review-sessions`,
      "POST",
    );
    expect(session.cards.map((card) => card.topic)).toEqual(["1410", "966"]);

    const answer = (noteId: string, remembered: unknown = true) =>
      apiFetch(`/api/review-sessions/${session.id}/results`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ noteId, remembered }),
      });
    const code = async (response: Response) => [response.status, (await response.json()).code];

    expect((await answer(first.id)).status).toBe(201);
    expect(await code(await answer(first.id, false))).toEqual([409, "RESULT_EXISTS"]);
    expect((await answer(foreign.id)).status).toBe(404);
    expect((await answer(second.id, "tak")).status).toBe(400);
    expect((await answer(second.id, false)).status).toBe(201);

    const finish = () => apiFetch(`/api/review-sessions/${session.id}/finish`, { method: "POST" });
    const summary = await finish();
    expect(summary.status).toBe(200);
    expect(await summary.json()).toMatchObject({
      sessionId: session.id,
      rememberedCount: 1,
      totalCount: 2,
      percent: 50,
    });
    expect(await code(await finish())).toEqual([409, "SESSION_FINISHED"]);
    expect(await code(await answer(second.id))).toEqual([409, "SESSION_FINISHED"]);
    expect(
      (
        await apiFetch("/api/review-sessions/00000000-0000-4000-8000-000000000000/finish", {
          method: "POST",
        })
      ).status,
    ).toBe(404);
  });

  it("usunięcie karteczki usuwa jej wyniki powtórek", async () => {
    const [first] = await createNotes(["1410", "tor, tuz"]);
    const session = await prisma.reviewSession.create({ data: { boardId } });
    await prisma.reviewResult.create({
      data: { sessionId: session.id, noteId: first.id, remembered: true },
    });

    await prisma.note.delete({ where: { id: first.id } });

    await waitFor(async () => expect(await prisma.reviewResult.count()).toBe(0));
  });
});
