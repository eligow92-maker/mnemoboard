import type { Board, Connection, Zone } from "@prisma/client";
import { notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import { chainPositions } from "@/modules/arrangement/chain";
import { toNoteView, type NoteView } from "@/modules/notes/service";
import type { BoardInput } from "./schema";

export interface BoardSummary extends Board {
  noteCount: number;
  lastReview: null;
}

export async function listBoards(): Promise<BoardSummary[]> {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { notes: true } } },
  });
  return boards.map(({ _count, ...board }) => ({
    ...board,
    noteCount: _count.notes,
    lastReview: null,
  }));
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
