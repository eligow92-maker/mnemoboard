import type { Board, Connection, Zone } from "@prisma/client";
import { notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import { chainPositions } from "@/modules/arrangement/chain";
import { toNoteView, type NoteView } from "@/modules/notes/service";
import { percent } from "@/modules/review/score";
import type { BoardInput } from "./schema";

export interface LastReview {
  finishedAt: Date;
  rememberedCount: number;
  totalCount: number;
  percent: number;
}

export interface BoardSummary extends Board {
  noteCount: number;
  // null, gdy plansza nie ma ukończonej powtórki.
  lastReview: LastReview | null;
}

// Lista plansz z liczbą karteczek i wynikiem ostatniej ukończonej powtórki — stała liczba zapytań.
export async function listBoards(): Promise<BoardSummary[]> {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { notes: true } },
      reviewSessions: {
        where: { finishedAt: { not: null }, results: { some: {} } },
        orderBy: { finishedAt: "desc" },
        take: 1,
        include: { results: { select: { remembered: true } } },
      },
    },
  });

  return boards.map(({ _count, reviewSessions, ...board }) => {
    const [session] = reviewSessions;
    let lastReview: LastReview | null = null;
    if (session?.finishedAt) {
      const totalCount = session.results.length;
      const rememberedCount = session.results.filter((result) => result.remembered).length;
      lastReview = {
        finishedAt: session.finishedAt,
        rememberedCount,
        totalCount,
        percent: percent(rememberedCount, totalCount),
      };
    }
    return { ...board, noteCount: _count.notes, lastReview };
  });
}

export async function createBoard(input: BoardInput): Promise<Board> {
  return prisma.board.create({ data: { name: input.name } });
}

export interface BoardDetail extends Board {
  notes: NoteView[];
  zones: Zone[];
  connections: Connection[];
}

export async function requireBoard(boardId: string): Promise<Board> {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) throw notFound("Plansza nie istnieje");
  return board;
}

// Cała plansza jednym odczytem: trzy zapytania po indeksach board_id, bez N+1.
export async function getBoardDetail(boardId: string): Promise<BoardDetail> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      notes: { orderBy: { createdAt: "asc" } },
      zones: { orderBy: { createdAt: "asc" } },
      connections: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!board) throw notFound("Plansza nie istnieje");
  const positions = chainPositions(
    board.connections.filter((connection) => connection.kind === "chain"),
  );
  return {
    ...board,
    notes: board.notes.map((note) => toNoteView(note, positions.get(note.id) ?? null)),
  };
}
