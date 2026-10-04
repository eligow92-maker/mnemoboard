import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import { ReviewScreen } from "@/components/review/review-screen";
import { prisma } from "@/lib/db";
import type { NoteColor } from "@/modules/notes/colors";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { resetDb } from "../helpers/db";
import { mockReactFlow } from "../helpers/react-flow";

describe("TASK-028 US-018 Filtr koloru w powtórce", () => {
  let boardId: string;
  let day = 0;

  // Każda kolejna karteczka ma późniejszą datę utworzenia.
  const createNote = (topic: string, color: NoteColor) =>
    prisma.note.create({
      data: {
        boardId,
        topic,
        imageWords: `słowa ${topic}`,
        color,
        x: 0,
        y: 0,
        createdAt: new Date(Date.UTC(2026, 0, ++day)),
      },
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

  beforeAll(() => {
    mockReactFlow();
  });

  beforeEach(async () => {
    await resetDb();
    installApiFetch();
    day = 0;
    boardId = (await prisma.board.create({ data: { name: "Historia Polski" } })).id;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-1: powtórka z zaznaczonym tylko kolorem czerwonym pokazuje wyłącznie czerwone karteczki", async () => {
    await createNote("Czerwona 1", "red");
    await createNote("Żółta", "yellow");
    await createNote("Czerwona 2", "red");

    render(<ReviewScreen boardId={boardId} colors={["red"]} />);

    expect(await screen.findByText("Karta 1 z 2")).toBeInTheDocument();
    expect(await topicsInReviewOrder()).toEqual(["Czerwona 1", "Czerwona 2"]);
  });

  it("AC-2: okno rozpoczęcia powtórki ma wszystkie kolory zaznaczone", async () => {
    const user = userEvent.setup();
    await createNote("Czerwona", "red");
    await createNote("Zielona", "green");
    render(<BoardEditorScreen boardId={boardId} />);

    await user.click(await screen.findByRole("button", { name: "Rozpocznij powtórkę" }));

    const dialog = await screen.findByRole("dialog");
    const checkboxes = within(dialog).getAllByRole("checkbox");
    expect(checkboxes.map((checkbox) => checkbox.getAttribute("aria-label"))).toEqual([
      "żółty",
      "czerwony",
      "pomarańczowy",
      "zielony",
      "niebieski",
    ]);
    for (const checkbox of checkboxes) expect(checkbox).toBeChecked();
  });

  it('AC-3: powtórka z zaznaczonym tylko kolorem niebieskim, gdy nie ma niebieskich karteczek, się nie rozpoczyna i pokazuje komunikat "Brak karteczek w wybranych kolorach"', async () => {
    await createNote("Czerwona", "red");
    await createNote("Żółta", "yellow");

    render(<ReviewScreen boardId={boardId} colors={["blue"]} />);

    expect(await screen.findByText("Brak karteczek w wybranych kolorach")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Odsłoń" })).not.toBeInTheDocument();
    expect(await prisma.reviewSession.count()).toBe(0);
  });

  it("AC-4: w łańcuchu A→B→C, gdzie A i C są czerwone, a B żółta, powtórka tylko czerwonych pokazuje karteczki w kolejności A, C", async () => {
    // Daty utworzenia są odwrotne do kolejności łańcucha, a luźna żółta jest najstarsza.
    await createNote("Luźna", "yellow");
    const c = await createNote("C", "red");
    const b = await createNote("B", "yellow");
    const a = await createNote("A", "red");
    for (const [source, target] of [
      [a, b],
      [b, c],
    ]) {
      await prisma.connection.create({
        data: { boardId, sourceNoteId: source.id, targetNoteId: target.id, kind: "chain" },
      });
    }

    render(<ReviewScreen boardId={boardId} colors={["red"]} />);

    expect(await topicsInReviewOrder()).toEqual(["A", "C"]);
  });

  it("odznaczenie kolorów w oknie zawęża adres powtórki do wybranych kolorów", async () => {
    const user = userEvent.setup();
    await createNote("Czerwona", "red");
    render(<BoardEditorScreen boardId={boardId} />);

    await user.click(await screen.findByRole("button", { name: "Rozpocznij powtórkę" }));
    const dialog = await screen.findByRole("dialog");
    for (const name of ["żółty", "pomarańczowy", "zielony", "niebieski"]) {
      await user.click(within(dialog).getByRole("checkbox", { name }));
    }

    expect(within(dialog).getByRole("link", { name: "Rozpocznij" })).toHaveAttribute(
      "href",
      `/boards/${boardId}/review?colors=red`,
    );
  });

  it("nie da się rozpocząć powtórki bez żadnego zaznaczonego koloru", async () => {
    const user = userEvent.setup();
    render(<BoardEditorScreen boardId={boardId} />);

    await user.click(await screen.findByRole("button", { name: "Rozpocznij powtórkę" }));
    const dialog = await screen.findByRole("dialog");
    for (const checkbox of within(dialog).getAllByRole("checkbox")) await user.click(checkbox);

    expect(within(dialog).queryByRole("link", { name: "Rozpocznij" })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Rozpocznij" })).toBeDisabled();
  });

  it("API: nieznany kolor i pusta lista kolorów dają 400, a brak ciała oznacza wszystkie kolory", async () => {
    await createNote("Czerwona", "red");
    const post = (body?: unknown) =>
      apiFetch(`/api/boards/${boardId}/review-sessions`, {
        method: "POST",
        headers: body === undefined ? undefined : { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

    expect((await post({ colors: ["purple"] })).status).toBe(400);
    expect((await post({ colors: [] })).status).toBe(400);
    const all = await post();
    expect(all.status).toBe(201);
    expect((await all.json()).cards).toHaveLength(1);
  });

  it("API: brak karteczek w wybranych kolorach daje 422 NO_NOTES_IN_COLORS bez zakładania sesji", async () => {
    await createNote("Czerwona", "red");

    const response = await apiFetch(`/api/boards/${boardId}/review-sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ colors: ["blue"] }),
    });

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ code: "NO_NOTES_IN_COLORS" });
    expect(await prisma.reviewSession.count()).toBe(0);
  });
});
