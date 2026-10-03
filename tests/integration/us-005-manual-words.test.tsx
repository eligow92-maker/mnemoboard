import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import { prisma } from "@/lib/db";
import { seedPegWords } from "@/modules/word-images/seed";
import { installApiFetch } from "../helpers/api-fetch";
import { clickPane, getNoteNode } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { mockReactFlow } from "../helpers/react-flow";

describe("TASK-011 US-005 Ręczne słowa-obrazy", () => {
  let boardId: string;

  beforeAll(() => {
    mockReactFlow();
  });

  beforeEach(async () => {
    await resetDb();
    await seedPegWords(prisma);
    installApiFetch();
    boardId = (await prisma.board.create({ data: { name: "Biologia" } })).id;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('AC-1: słowa-obrazy "mity, chondryt" wpisane i zapisane dla karteczki "Mitochondrium" są widoczne na karteczce pod zagadnieniem', async () => {
    const user = userEvent.setup();
    const note = await prisma.note.create({
      data: { boardId, topic: "Mitochondrium", x: 100, y: 100 },
    });
    render(<BoardEditorScreen boardId={boardId} />);

    await user.click(await waitFor(() => getNoteNode(note.id)));
    await user.type(await screen.findByLabelText("Słowa-obrazy"), "mity, chondryt");
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    await waitFor(() => expect(getNoteNode(note.id)).toHaveTextContent("mity, chondryt"));
    const node = getNoteNode(note.id);
    const topic = screen.getByText("Mitochondrium");
    const words = screen.getByText("mity, chondryt");
    expect(node).toContainElement(words);
    expect(topic.compareDocumentPosition(words) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect((await prisma.note.findUniqueOrThrow({ where: { id: note.id } })).imageWords).toBe(
      "mity, chondryt",
    );
  });

  it('AC-2: "Generuj słowa" dla zagadnienia bez cyfr nie generuje słów i pokazuje komunikat "Brak liczb – wpisz słowa-obrazy samodzielnie"', async () => {
    const user = userEvent.setup();
    const note = await prisma.note.create({
      data: { boardId, topic: "Mitochondrium", x: 100, y: 100 },
    });
    render(<BoardEditorScreen boardId={boardId} />);

    await user.click(await waitFor(() => getNoteNode(note.id)));
    await user.click(await screen.findByRole("button", { name: "Generuj słowa" }));

    expect(
      await screen.findByText("Brak liczb – wpisz słowa-obrazy samodzielnie"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Słowa-obrazy")).toHaveValue("");
  });

  it("nowa karteczka zapisuje słowa-obrazy podane przy tworzeniu", async () => {
    const user = userEvent.setup();
    const { container } = render(<BoardEditorScreen boardId={boardId} />);

    await user.click(await screen.findByRole("button", { name: "Dodaj karteczkę" }));
    clickPane(container, 300, 300);
    await user.type(await screen.findByLabelText("Zagadnienie"), "Mitochondrium");
    await user.type(screen.getByLabelText("Słowa-obrazy"), "mity");
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    await waitFor(async () =>
      expect(await prisma.note.findFirst()).toMatchObject({
        topic: "Mitochondrium",
        imageWords: "mity",
      }),
    );
  });

  it("wyczyszczenie pola usuwa słowa-obrazy karteczki", async () => {
    const user = userEvent.setup();
    const note = await prisma.note.create({
      data: { boardId, topic: "1410", imageWords: "tor, dos", x: 100, y: 100 },
    });
    render(<BoardEditorScreen boardId={boardId} />);

    await user.click(await waitFor(() => getNoteNode(note.id)));
    await user.clear(await screen.findByLabelText("Słowa-obrazy"));
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    await waitFor(async () =>
      expect(
        (await prisma.note.findUniqueOrThrow({ where: { id: note.id } })).imageWords,
      ).toBeNull(),
    );
    expect(getNoteNode(note.id)).not.toHaveTextContent("tor, dos");
  });
});
