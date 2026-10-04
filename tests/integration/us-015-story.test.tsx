import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import { ReviewScreen } from "@/components/review/review-screen";
import { prisma } from "@/lib/db";
import { installApiFetch } from "../helpers/api-fetch";
import { clickNote, getNoteNode } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { mockReactFlow } from "../helpers/react-flow";

const STORY = "Po torze jedzie dos";

describe("TASK-025 US-015 Opowiadanie na karteczce", () => {
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

  it('AC-1: opowiadanie "Po torze jedzie dos" wpisane do karteczki "1410" ze słowami-obrazami "tor, dos" jest po odświeżeniu strony widoczne pod słowami-obrazami', async () => {
    const user = userEvent.setup();
    const note = await prisma.note.create({
      data: { boardId, topic: "1410", imageWords: "tor, dos", x: 100, y: 100 },
    });
    const first = render(<BoardEditorScreen boardId={boardId} />);

    await clickNote(note.id);
    await user.type(await screen.findByLabelText("Opowiadanie"), STORY);
    await user.click(screen.getByRole("button", { name: "Zapisz" }));
    await waitFor(async () =>
      expect((await prisma.note.findUniqueOrThrow({ where: { id: note.id } })).story).toBe(STORY),
    );
    first.unmount();
    render(<BoardEditorScreen boardId={boardId} />);

    const node = await waitFor(() => getNoteNode(note.id));
    const words = screen.getByText("tor, dos");
    const story = screen.getByText(STORY);
    expect(node).toContainElement(story);
    expect(words.compareDocumentPosition(story) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("AC-2: opowiadanie karteczki w powtórce jest przed odsłonięciem zakryte", async () => {
    await prisma.note.create({
      data: { boardId, topic: "1410", imageWords: "tor, dos", story: STORY, x: 0, y: 0 },
    });
    render(<ReviewScreen boardId={boardId} />);

    expect(await screen.findByTestId("review-topic")).toHaveTextContent("1410");

    expect(screen.queryByText(STORY)).not.toBeInTheDocument();
    expect(screen.queryByText("tor, dos")).not.toBeInTheDocument();
    expect(screen.getByText("Słowa-obrazy i opowiadanie są zakryte.")).toBeInTheDocument();
  });

  it('AC-3: po wybraniu "Odsłoń" w powtórce widać opowiadanie obok słów-obrazów', async () => {
    const user = userEvent.setup();
    await prisma.note.create({
      data: { boardId, topic: "1410", imageWords: "tor, dos", story: STORY, x: 0, y: 0 },
    });
    render(<ReviewScreen boardId={boardId} />);

    await user.click(await screen.findByRole("button", { name: "Odsłoń" }));

    expect(screen.getByText("tor, dos")).toBeInTheDocument();
    expect(screen.getByText(STORY)).toBeInTheDocument();
  });

  it('AC-4: zapis opowiadania dłuższego niż 2000 znaków jest odrzucony z komunikatem "Opowiadanie może mieć najwyżej 2000 znaków"', async () => {
    const user = userEvent.setup();
    const note = await prisma.note.create({
      data: { boardId, topic: "1410", imageWords: "tor, dos", x: 100, y: 100 },
    });
    render(<BoardEditorScreen boardId={boardId} />);

    await clickNote(note.id);
    fireEvent.change(await screen.findByLabelText("Opowiadanie"), {
      target: { value: "a".repeat(2001) },
    });
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    expect(
      await screen.findByText("Opowiadanie może mieć najwyżej 2000 znaków"),
    ).toBeInTheDocument();
    expect((await prisma.note.findUniqueOrThrow({ where: { id: note.id } })).story).toBeNull();
  });

  it("karteczka tylko z opowiadaniem, bez słów-obrazów, nie wchodzi do powtórki", async () => {
    await prisma.note.create({
      data: { boardId, topic: "1410", imageWords: null, story: STORY, x: 0, y: 0 },
    });
    render(<ReviewScreen boardId={boardId} />);

    expect(
      await screen.findByText("Dodaj słowa-obrazy, aby rozpocząć powtórkę"),
    ).toBeInTheDocument();
  });
});
