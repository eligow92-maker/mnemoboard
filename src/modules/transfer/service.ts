import { randomUUID } from "node:crypto";
import type { Board, Prisma, PrismaClient } from "@prisma/client";
import { ApiError, notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import {
  backupFileName,
  buildBoardExportFile,
  exportFileName,
  parseBackupFile,
  parseBoardExportFile,
  serializeBoard,
} from "./format";
import {
  BACKUP_FILE_MAX_BYTES,
  BOARD_FILE_MAX_BYTES,
  type BackupBoard,
  type BackupFile,
  type BoardExportFile,
} from "./schema";
import { FILE_FORMAT, FILE_VERSION } from "./schema";
import { CUSTOM_PEG_MAX_COUNT, PEG_WORD_MAX_LENGTH } from "@/modules/word-images/schema";

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
): Promise<{ board: Board; noteIds: Map<string, string> }> {
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
  return { board, noteIds };
}

// Import planszy: zawsze nowa plansza, nic istniejącego nie jest zmieniane.
export async function importBoard(file: BoardExportFile): Promise<Board> {
  return prisma.$transaction(
    async (tx) => {
      const taken = new Set(
        (await tx.board.findMany({ select: { name: true } })).map((b) => b.name),
      );
      return (await createBoardFromContent(tx, file.board, taken)).board;
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

// Rodzaj pliku Mnemoboard ("board" lub "backup"), jeśli to w ogóle plik Mnemoboard.
function fileKind(json: unknown): unknown {
  if (typeof json !== "object" || json === null) return undefined;
  const { format, kind } = json as { format?: unknown; kind?: unknown };
  return format === FILE_FORMAT ? kind : undefined;
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
  // Częsta pomyłka: pełna kopia ("Pobierz kopię") wczytana jako import jednej planszy.
  if (fileKind(json) === "backup") {
    throw new ApiError(
      400,
      "INVALID_EXPORT_FILE",
      "To jest pełna kopia zapasowa. Wczytaj ją przyciskiem „Przywróć z kopii”.",
    );
  }
  const parsed = parseBoardExportFile(json);
  if (!parsed.success) {
    throw new ApiError(400, "INVALID_EXPORT_FILE", BOARD_FILE_INVALID_MESSAGE);
  }
  return parsed.data;
}

export interface RestoreResult {
  dryRun: boolean;
  boardsAdded: number;
  // Hasła wbudowane, które przyjęły słowo z kopii.
  pegWordsUpdated: number;
  customPegWordsAdded: number;
}

interface PegPlan {
  updates: BackupFile["pegWords"];
  additions: BackupFile["pegWords"];
}

// Lista GSP przy przywracaniu tylko dokłada: słowo hasła wbudowanego jest przyjmowane wyłącznie
// wtedy, gdy użytkownik go nie zmienił; własne wpisy — tylko brakujące.
async function planPegWords(
  client: Prisma.TransactionClient | PrismaClient,
  pegWords: BackupFile["pegWords"],
): Promise<PegPlan> {
  const existing = new Map((await client.pegWord.findMany()).map((peg) => [peg.number, peg]));
  const plan: PegPlan = { updates: [], additions: [] };
  for (const peg of pegWords) {
    const current = existing.get(peg.number);
    if (peg.number.length >= 3) {
      if (!current) plan.additions.push(peg);
    } else if (
      current &&
      current.defaultWord !== null &&
      current.word === current.defaultWord &&
      peg.word !== current.word &&
      peg.word.length <= PEG_WORD_MAX_LENGTH
    ) {
      plan.updates.push(peg);
    }
  }
  const customCount = [...existing.values()].filter((peg) => peg.defaultWord === null).length;
  if (customCount + plan.additions.length > CUSTOM_PEG_MAX_COUNT) {
    throw new ApiError(
      409,
      "PEG_LIMIT",
      `Możesz mieć najwyżej ${CUSTOM_PEG_MAX_COUNT} własnych wpisów`,
    );
  }
  return plan;
}

async function addReviewSessions(
  tx: Prisma.TransactionClient,
  boardId: string,
  noteIds: ReadonlyMap<string, string>,
  sessions: BackupBoard["reviewSessions"],
): Promise<void> {
  const sessionIds = sessions.map(() => randomUUID());
  await tx.reviewSession.createMany({
    data: sessions.map((session, index) => ({
      id: sessionIds[index],
      boardId,
      startedAt: new Date(session.startedAt),
      finishedAt: session.finishedAt === null ? null : new Date(session.finishedAt),
    })),
  });
  await tx.reviewResult.createMany({
    data: sessions.flatMap((session, index) =>
      session.results.map((result) => ({
        sessionId: sessionIds[index],
        noteId: noteIds.get(result.noteId) ?? "",
        remembered: result.remembered,
        answeredAt: new Date(result.answeredAt),
      })),
    ),
  });
}

// Przywrócenie kopii: tylko dokłada dane (nic istniejącego nie jest zastępowane), w jednej
// transakcji. Z `dryRun` tylko zlicza, co zostałoby dodane.
export async function restoreBackup(
  file: BackupFile,
  options: { dryRun: boolean },
): Promise<RestoreResult> {
  if (options.dryRun) {
    const plan = await planPegWords(prisma, file.pegWords);
    return {
      dryRun: true,
      boardsAdded: file.boards.length,
      pegWordsUpdated: plan.updates.length,
      customPegWordsAdded: plan.additions.length,
    };
  }

  return prisma.$transaction(
    async (tx) => {
      const plan = await planPegWords(tx, file.pegWords);
      const taken = new Set(
        (await tx.board.findMany({ select: { name: true } })).map((b) => b.name),
      );
      for (const content of file.boards) {
        const { board, noteIds } = await createBoardFromContent(tx, content, taken);
        taken.add(board.name);
        await addReviewSessions(tx, board.id, noteIds, content.reviewSessions);
      }
      for (const peg of plan.updates) {
        await tx.pegWord.update({ where: { number: peg.number }, data: { word: peg.word } });
      }
      await tx.pegWord.createMany({ data: plan.additions });
      return {
        dryRun: false,
        boardsAdded: file.boards.length,
        pegWordsUpdated: plan.updates.length,
        customPegWordsAdded: plan.additions.length,
      };
    },
    { timeout: 120_000 },
  );
}

// Pełna kopia: wszystkie plansze z historią powtórek oraz lista GSP — hasła wbudowane ze zmienionym
// słowem i wszystkie własne wpisy.
export async function buildBackup(
  now = new Date(),
): Promise<{ file: BackupFile; fileName: string }> {
  const [boards, pegWords] = await Promise.all([
    prisma.board.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: {
        notes: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
        zones: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
        connections: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
        reviewSessions: {
          orderBy: [{ startedAt: "asc" }, { id: "asc" }],
          include: { results: { orderBy: { answeredAt: "asc" } } },
        },
      },
    }),
    prisma.pegWord.findMany(),
  ]);

  const file: BackupFile = {
    format: FILE_FORMAT,
    version: FILE_VERSION,
    kind: "backup",
    exportedAt: now.toISOString(),
    boards: boards.map((board) => ({
      ...serializeBoard(board),
      reviewSessions: board.reviewSessions.map((session) => ({
        startedAt: session.startedAt.toISOString(),
        finishedAt: session.finishedAt?.toISOString() ?? null,
        results: session.results.map((result) => ({
          noteId: result.noteId,
          remembered: result.remembered,
          answeredAt: result.answeredAt.toISOString(),
        })),
      })),
    })),
    pegWords: pegWords
      .filter((peg) => peg.defaultWord === null || peg.word !== peg.defaultWord)
      .map((peg) => ({ number: peg.number, word: peg.word }))
      .sort((a, b) => a.number.length - b.number.length || a.number.localeCompare(b.number)),
  };
  return { file, fileName: backupFileName(now) };
}

export const BACKUP_FILE_INVALID_MESSAGE = "Plik nie jest poprawną kopią Mnemoboard";

// Wczytuje i waliduje plik kopii z żądania.
export async function readBackupFile(request: Request): Promise<BackupFile> {
  const json = await readJsonFile(request, {
    maxBytes: BACKUP_FILE_MAX_BYTES,
    label: "50 MB",
    invalidCode: "INVALID_BACKUP_FILE",
    invalidMessage: BACKUP_FILE_INVALID_MESSAGE,
  });
  if (fileKind(json) === "board") {
    throw new ApiError(
      400,
      "INVALID_BACKUP_FILE",
      "To jest eksport jednej planszy. Wczytaj go przyciskiem „Importuj planszę”.",
    );
  }
  const parsed = parseBackupFile(json);
  if (!parsed.success) {
    throw new ApiError(400, "INVALID_BACKUP_FILE", BACKUP_FILE_INVALID_MESSAGE);
  }
  return parsed.data;
}
