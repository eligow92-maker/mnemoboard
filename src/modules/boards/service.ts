import type { Board } from "@prisma/client";
import { prisma } from "@/lib/db";
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
