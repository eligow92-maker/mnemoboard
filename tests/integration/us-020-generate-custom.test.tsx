import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import type { GeneratedWordImagesDto } from "@/lib/api-types";
import { prisma } from "@/lib/db";
import { seedPegWords } from "@/modules/word-images/seed";
import { apiJson, installApiFetch } from "../helpers/api-fetch";
import { clickNote } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { mockReactFlow } from "../helpers/react-flow";

describe("TASK-031 US-020 Generator korzysta z własnych wpisów", () => {
  let boardId: string;
  let words: Record<string, string>;

  const customEntry = (number: string, word: string) =>
    prisma.pegWord.create({ data: { number, word } });

  // Otwiera edytor karteczki o podanym zagadnieniu, używa "Generuj słowa" i zwraca pole słów-obrazów.
  async function generateFor(topic: string): Promise<HTMLElement> {
    const user = userEvent.setup();
    const note = await prisma.note.create({ data: { boardId, topic, x: 100, y: 100 } });
    render(<BoardEditorScreen boardId={boardId} />);
    await clickNote(note.id);
    await user.click(await screen.findByRole("button", { name: "Generuj słowa" }));
    return screen.getByLabelText("Słowa-obrazy");
  }

  beforeAll(() => {
    mockReactFlow();
  });

  beforeEach(async () => {
    await resetDb();
    await prisma.pegWord.deleteMany({ where: { defaultWord: null } });
    await seedPegWords(prisma);
    installApiFetch();
    boardId = (await prisma.board.create({ data: { name: "Numery telefonów" } })).id;
    words = Object.fromEntries(
      (await prisma.pegWord.findMany()).map((peg) => [peg.number, peg.word]),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('AC-1: "Generuj słowa" dla zagadnienia "333" z własnym wpisem "333" daje "mumia-mysz"', async () => {
    await customEntry("333", "mumia-mysz");

    const field = await generateFor("333");

    await vi.waitFor(() => expect(field).toHaveValue("mumia-mysz"));
  });

  it('AC-2: "Generuj słowa" dla zagadnienia "48333" z własnym wpisem "333" daje kolejno słowo z listy GSP dla "48" i "mumia-mysz"', async () => {
    await customEntry("333", "mumia-mysz");

    const field = await generateFor("48333");

    await vi.waitFor(() => expect(field).toHaveValue(`${words["48"]}, mumia-mysz`));
  });

  it('AC-3: "Generuj słowa" dla zagadnienia "3334" z własnymi wpisami "333" i "3334" daje słowo wpisu "3334"', async () => {
    await customEntry("333", "mumia-mysz");
    await customEntry("3334", "mumia-mur");

    const field = await generateFor("3334");

    await vi.waitFor(() => expect(field).toHaveValue("mumia-mur"));
  });

  it('AC-4: "Generuj słowa" dla zagadnienia "333" bez własnych wpisów daje słowo z listy GSP dla "33" i słowo dla "3"', async () => {
    const field = await generateFor("333");

    await vi.waitFor(() => expect(field).toHaveValue(`${words["33"]}, ${words["3"]}`));
  });

  it("API: segmenty mają źródło custom albo builtin", async () => {
    await customEntry("333", "mumia-mysz");

    const generated = await apiJson<GeneratedWordImagesDto>("/api/word-images/generate", "POST", {
      topic: "48333",
    });

    expect(generated.segments.map((segment) => [segment.number, segment.source])).toEqual([
      ["48", "builtin"],
      ["333", "custom"],
    ]);
  });

  it("API: zmiana słowa własnego wpisu jest od razu używana przez generator", async () => {
    await customEntry("333", "mumia-mysz");
    await prisma.pegWord.update({ where: { number: "333" }, data: { word: "mamut" } });

    const generated = await apiJson<GeneratedWordImagesDto>("/api/word-images/generate", "POST", {
      topic: "333",
    });

    expect(generated.imageWords).toBe("mamut");
  });
});
