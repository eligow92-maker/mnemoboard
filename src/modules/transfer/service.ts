import { notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import { buildBoardExportFile, exportFileName } from "./format";

// Plik eksportu planszy: karteczki, strefy i połączenia, bez historii powtórek.
export async function exportBoard(boardId: string, now = new Date()) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      notes: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
      zones: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
      connections: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
    },
  });
  if (!board) throw notFound("Plansza nie istnieje");
  return {
    file: buildBoardExportFile(board, now),
    fileName: exportFileName(board.name, now),
  };
}
