import { randomUUID } from "node:crypto";
import type { Board, Prisma } from "@prisma/client";
import { ApiError, notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import { buildBoardExportFile, exportFileName, parseBoardExportFile } from "./format";
import { BOARD_FILE_MAX_BYTES, type BoardExportFile } from "./schema";

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

const BOARD_NAME_MAX_LENGTH = 100;

// Wolna nazwa planszy: przy zajętej dopisuje " (import)", potem " (import 2)", " (import 3)"…
// Podstawa jest skracana tak, by całość zmieściła się w limicie nazwy.
export function uniqueBoardName(name: string, taken: ReadonlySet<string>): string {
  if (!taken.has(name)) return name;
  for (let attempt = 1; ; attempt++) {
    const suffix = attempt === 1 ? " (import)" : ` (import ${attempt})`;
    const candidate = `${name.slice(0, BOARD_NAME_MAX_LENGTH - suffix.length)}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}

type BoardContent = BoardExportFile["board"];

// Zapisuje planszę z pliku jako nową: nowe identyfikatory, powiązania odtworzone z mapowania,
// wszystko w jednej transakcji (wsadowo, bez zapytania na rekord).
export async function createBoardFromContent(
  tx: Prisma.TransactionClient,
  content: BoardContent,
  taken: ReadonlySet<string>,
): Promise<Board> {
  const board = await tx.board.create({ data: { name: uniqueBoardName(content.name, taken) } });
  const zoneIds = new Map(content.zones.map((zone) => [zone.id, randomUUID()]));
  const noteIds = new Map(content.notes.map((note) => [note.id, randomUUID()]));

  await tx.zone.createMany({
    data: content.zones.map((zone) => ({
      id: zoneIds.get(zone.id),
      boardId: board.id,
      name: zone.name,
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
      createdAt: new Date(zone.createdAt),
    })),
  });
  await tx.note.createMany({
    data: content.notes.map((note) => ({
      id: noteIds.get(note.id),
      boardId: board.id,
      zoneId: note.zoneId === null ? null : (zoneIds.get(note.zoneId) ?? null),
      topic: note.topic,
      imageWords: note.imageWords,
      story: note.story,
      emoji: note.emoji,
      color: note.color,
      x: note.x,
      y: note.y,
      createdAt: new Date(note.createdAt),
    })),
  });
  await tx.connection.createMany({
    data: content.connections.map((connection) => ({
      boardId: board.id,
      sourceNoteId: noteIds.get(connection.sourceNoteId) ?? "",
      targetNoteId: noteIds.get(connection.targetNoteId) ?? "",
      kind: connection.kind,
    })),
  });
  return board;
}

// Import planszy: zawsze nowa plansza, nic istniejącego nie jest zmieniane.
export async function importBoard(file: BoardExportFile): Promise<Board> {
  return prisma.$transaction(
    async (tx) => {
      const taken = new Set(
        (await tx.board.findMany({ select: { name: true } })).map((b) => b.name),
      );
      return createBoardFromContent(tx, file.board, taken);
    },
    { timeout: 60_000 },
  );
}

// Treść pliku z żądania: limit rozmiaru sprawdzany przed parsowaniem, błędy w języku użytkownika.
export async function readJsonFile(
  request: Request,
  limit: { maxBytes: number; label: string; invalidCode: string; invalidMessage: string },
): Promise<unknown> {
  const tooLarge = new ApiError(413, "FILE_TOO_LARGE", `Plik jest za duży (limit ${limit.label})`);
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > limit.maxBytes) throw tooLarge;

  const text = await request.text();
  if (Buffer.byteLength(text) > limit.maxBytes) throw tooLarge;
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(400, limit.invalidCode, limit.invalidMessage);
  }
}

export const BOARD_FILE_INVALID_MESSAGE = "Plik nie jest poprawnym eksportem Mnemoboard";

// Wczytuje i waliduje plik eksportu planszy z żądania.
export async function readBoardExportFile(request: Request): Promise<BoardExportFile> {
  const json = await readJsonFile(request, {
    maxBytes: BOARD_FILE_MAX_BYTES,
    label: "5 MB",
    invalidCode: "INVALID_EXPORT_FILE",
    invalidMessage: BOARD_FILE_INVALID_MESSAGE,
  });
  const parsed = parseBoardExportFile(json);
  if (!parsed.success) {
    throw new ApiError(400, "INVALID_EXPORT_FILE", BOARD_FILE_INVALID_MESSAGE);
  }
  return parsed.data;
}
