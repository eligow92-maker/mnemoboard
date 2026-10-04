import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import { ReviewScreen } from "@/components/review/review-screen";
import { prisma } from "@/lib/db";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { clickNote, getNoteNode } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { mockReactFlow } from "../helpers/react-flow";

const CASTLE_AND_SWORDS = "🏰⚔️";

describe("TASK-026 US-016 Emotki na karteczce", () => {
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

  it('AC-1: emotki "🏰⚔️" wpisane do karteczki są po odświeżeniu strony widoczne na karteczce', async () => {
    const user = userEvent.setup();
    const note = await prisma.note.create({ data: { boardId, topic: "1410", x: 100, y: 100 } });
    const first = render(<BoardEditorScreen boardId={boardId} />);

    await clickNote(note.id);
    fireEvent.change(await screen.findByLabelText("Emotki"), {
      target: { value: CASTLE_AND_SWORDS },
    });
    await user.click(screen.getByRole("button", { name: "Zapisz" }));
    await waitFor(async () =>
      expect((await prisma.note.findUniqueOrThrow({ where: { id: note.id } })).emoji).toBe(
        CASTLE_AND_SWORDS,
      ),
    );
    first.unmount();
    render(<BoardEditorScreen boardId={boardId} />);

    const node = await waitFor(() => getNoteNode(note.id));
    expect(node).toContainElement(screen.getByTestId("note-emoji"));
    expect(screen.getByTestId("note-emoji")).toHaveTextContent(CASTLE_AND_SWORDS);
  });

  it('AC-3: zapis 9 emotek jest odrzucony z komunikatem "Najwyżej 8 emotek"', async () => {
    const user = userEvent.setup();
    const note = await prisma.note.create({ data: { boardId, topic: "1410", x: 100, y: 100 } });
    render(<BoardEditorScreen boardId={boardId} />);

    await clickNote(note.id);
    fireEvent.change(await screen.findByLabelText("Emotki"), {
      target: { value: "🏰⚔️🐉👑🛡️🗡️🏹🎯🔥" },
    });
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    expect(await screen.findByText("Najwyżej 8 emotek")).toBeInTheDocument();
    expect((await prisma.note.findUniqueOrThrow({ where: { id: note.id } })).emoji).toBeNull();
  });

  it("AC-4: emotki karteczki w powtórce są przed odsłonięciem zakryte", async () => {
    const user = userEvent.setup();
    await prisma.note.create({
      data: {
        boardId,
        topic: "1410",
        imageWords: "tor, dos",
        emoji: CASTLE_AND_SWORDS,
        x: 0,
        y: 0,
      },
    });
    render(<ReviewScreen boardId={boardId} />);

    expect(await screen.findByTestId("review-topic")).toHaveTextContent("1410");

    expect(screen.queryByText(CASTLE_AND_SWORDS)).not.toBeInTheDocument();
    expect(screen.getByText("Słowa-obrazy i emotki są zakryte.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Odsłoń" }));
    expect(screen.getByText(CASTLE_AND_SWORDS)).toBeInTheDocument();
  });

  it("flaga, emotka z odcieniem skóry i sekwencja ZWJ liczą się jako po jedna emotka", async () => {
    const response = await apiFetch(`/api/boards/${boardId}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic: "Rodzina", emoji: "🇵🇱👍🏽👨‍👩‍👧‍👦🏰⚔️🐉👑🛡️", x: 0, y: 0 }),
    });

    expect(response.status).toBe(201);
  });
});
