import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import { prisma } from "@/lib/db";
import { seedPegWords } from "@/modules/word-images/seed";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { clickNote } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { mockReactFlow } from "../helpers/react-flow";

describe("TASK-010 US-006 Generowanie słów-obrazów dla liczb", () => {
  let boardId: string;
  let words: Record<string, string>;

  // Otwiera edytor karteczki o podanym zagadnieniu i używa akcji "Generuj słowa".
  async function generateFor(topic: string, imageWords: string | null = null) {
    const user = userEvent.setup();
    const note = await prisma.note.create({ data: { boardId, topic, imageWords, x: 100, y: 100 } });
    render(<BoardEditorScreen boardId={boardId} />);
    await clickNote(note.id);
    await user.click(await screen.findByRole("button", { name: "Generuj słowa" }));
    return { user, note };
  }

  beforeAll(() => {
    mockReactFlow();
  });

  beforeEach(async () => {
    await resetDb();
    await seedPegWords(prisma);
    installApiFetch();
    boardId = (await prisma.board.create({ data: { name: "Historia Polski" } })).id;
    words = Object.fromEntries(
      (await prisma.pegWord.findMany()).map((peg) => [peg.number, peg.word]),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('AC-1: "Generuj słowa" dla zagadnienia "1410" daje kolejno słowo z listy GSP dla "14" i słowo dla "10"', async () => {
    await generateFor("1410");

    await waitFor(() =>
      expect(screen.getByLabelText("Słowa-obrazy")).toHaveValue(`${words["14"]}, ${words["10"]}`),
    );
  });

  it('AC-2: "Generuj słowa" dla zagadnienia "15.07.1410" daje kolejno słowa dla "15", "07", "14" i "10"', async () => {
    await generateFor("15.07.1410");

    await waitFor(() =>
      expect(screen.getByLabelText("Słowa-obrazy")).toHaveValue(
        [words["15"], words["07"], words["14"], words["10"]].join(", "),
      ),
    );
  });

  it('AC-3: "Generuj słowa" dla zagadnienia "966" daje słowo dla "96" i słowo dla pojedynczej cyfry "6"', async () => {
    await generateFor("966");

    await waitFor(() =>
      expect(screen.getByLabelText("Słowa-obrazy")).toHaveValue(`${words["96"]}, ${words["6"]}`),
    );
  });

  it('AC-4: dla karteczki mającej już słowa-obrazy "Generuj słowa" zostawia je bez zmian do chwili potwierdzenia zastąpienia', async () => {
    const { user, note } = await generateFor("1410", "tor, dos");

    const dialog = await screen.findByRole("dialog", { name: "Zastąpić słowa-obrazy?" });
    expect(screen.getByLabelText("Słowa-obrazy")).toHaveValue("tor, dos");
    expect((await prisma.note.findUniqueOrThrow({ where: { id: note.id } })).imageWords).toBe(
      "tor, dos",
    );

    await user.click(within(dialog).getByRole("button", { name: "Zastąp" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Słowa-obrazy")).toHaveValue(`${words["14"]}, ${words["10"]}`);
  });

  it("rezygnacja z zastąpienia zostawia dotychczasowe słowa-obrazy", async () => {
    const { user } = await generateFor("1410", "tor, dos");

    const dialog = await screen.findByRole("dialog", { name: "Zastąpić słowa-obrazy?" });
    await user.click(within(dialog).getByRole("button", { name: "Anuluj" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Słowa-obrazy")).toHaveValue("tor, dos");
  });

  it("POST /api/word-images/generate zwraca segmenty, a dla zagadnienia bez cyfr 422 NO_DIGITS", async () => {
    const post = (topic: string) =>
      apiFetch("/api/word-images/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic }),
      });

    const generated = await post("Chrzest Polski 966");
    expect(generated.status).toBe(200);
    expect(await generated.json()).toEqual({
      segments: [
        { number: "96", word: words["96"], source: "builtin" },
        { number: "6", word: words["6"], source: "builtin" },
      ],
      imageWords: `${words["96"]}, ${words["6"]}`,
    });

    const noDigits = await post("Mitochondrium");
    expect(noDigits.status).toBe(422);
    expect(await noDigits.json()).toMatchObject({ code: "NO_DIGITS" });
    expect((await post("")).status).toBe(400);
  });
});
