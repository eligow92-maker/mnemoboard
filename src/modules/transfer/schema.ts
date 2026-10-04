import { z } from "zod";
import { validateChainLink, type ChainLink } from "@/modules/arrangement/chain";
import { NOTE_COLORS } from "@/modules/notes/colors";
import {
  NOTE_EMOJI_MAX_COUNT,
  NOTE_STORY_MAX_LENGTH,
  NOTE_TEXT_MAX_LENGTH,
  countGraphemes,
} from "@/modules/notes/schema";
import { CUSTOM_PEG_WORD_MAX_LENGTH } from "@/modules/word-images/schema";

// Format plików eksportu i kopii (ADR-005): JSON z numerem wersji.
export const FILE_FORMAT = "mnemoboard";
export const FILE_VERSION = 1;

export const BOARD_FILE_MAX_BYTES = 5 * 1024 * 1024;
export const BACKUP_FILE_MAX_BYTES = 50 * 1024 * 1024;

const MAX_NOTES = 2000;
const MAX_ZONES = 200;
const MAX_CONNECTIONS = 5000;
const MAX_BOARDS = 500;
const MAX_SESSIONS = 10000;
const MAX_CUSTOM_PEGS = 500;

const uuid = z.string().uuid();
const isoDate = z.string().datetime({ offset: true });
const nullableText = (max: number) => z.string().max(max).nullable();

const exportNoteSchema = z.object({
  id: uuid,
  zoneId: uuid.nullable(),
  topic: z.string().trim().min(1).max(NOTE_TEXT_MAX_LENGTH),
  imageWords: nullableText(NOTE_TEXT_MAX_LENGTH),
  story: nullableText(NOTE_STORY_MAX_LENGTH),
  emoji: nullableText(64).refine(
    (value) => value === null || countGraphemes(value) <= NOTE_EMOJI_MAX_COUNT,
  ),
  color: z.enum(NOTE_COLORS),
  x: z.number().finite(),
  y: z.number().finite(),
  createdAt: isoDate,
});

const exportZoneSchema = z.object({
  id: uuid,
  name: z.string().trim().min(1).max(60),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite().positive(),
  height: z.number().finite().positive(),
  createdAt: isoDate,
});

const exportConnectionSchema = z.object({
  sourceNoteId: uuid,
  targetNoteId: uuid,
  kind: z.enum(["association", "chain"]),
});

const boardContentSchema = z.object({
  name: z.string().trim().min(1).max(100),
  createdAt: isoDate,
  notes: z.array(exportNoteSchema).max(MAX_NOTES),
  zones: z.array(exportZoneSchema).max(MAX_ZONES),
  connections: z.array(exportConnectionSchema).max(MAX_CONNECTIONS),
});

type BoardContent = z.infer<typeof boardContentSchema>;

// Powiązania w pliku muszą spełniać te same reguły co w aplikacji; plik łamiący je jest
// odrzucany w całości.
function checkBoardRelations(board: BoardContent, ctx: z.RefinementCtx): void {
  const fail = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  const noteIds = new Set(board.notes.map((note) => note.id));
  const zoneIds = new Set(board.zones.map((zone) => zone.id));
  if (noteIds.size !== board.notes.length) fail("Powtórzone identyfikatory karteczek");
  if (zoneIds.size !== board.zones.length) fail("Powtórzone identyfikatory stref");
  for (const note of board.notes) {
    if (note.zoneId !== null && !zoneIds.has(note.zoneId)) fail("Karteczka w nieznanej strefie");
  }

  const pairs = new Set<string>();
  const chain: ChainLink[] = [];
  for (const { sourceNoteId, targetNoteId, kind } of board.connections) {
    if (!noteIds.has(sourceNoteId) || !noteIds.has(targetNoteId)) {
      fail("Połączenie wskazuje karteczkę spoza pliku");
      continue;
    }
    if (sourceNoteId === targetNoteId) {
      fail("Karteczka nie może być połączona sama ze sobą");
      continue;
    }
    const pair = [sourceNoteId, targetNoteId].sort().join(":");
    if (pairs.has(pair)) {
      fail("Para karteczek ma więcej niż jedno połączenie");
      continue;
    }
    pairs.add(pair);
    if (kind === "chain") {
      if (validateChainLink(chain, sourceNoteId, targetNoteId)) fail("Niepoprawny łańcuch");
      else chain.push({ sourceNoteId, targetNoteId });
    }
  }
}

const exportBoardSchema = boardContentSchema.superRefine(checkBoardRelations);

const fileHeader = {
  format: z.literal(FILE_FORMAT),
  version: z.literal(FILE_VERSION),
  exportedAt: isoDate,
};

export const boardExportFileSchema = z.object({
  ...fileHeader,
  kind: z.literal("board"),
  board: exportBoardSchema,
});

const reviewSessionSchema = z.object({
  startedAt: isoDate,
  finishedAt: isoDate.nullable(),
  results: z.array(z.object({ noteId: uuid, remembered: z.boolean(), answeredAt: isoDate })),
});

const backupBoardSchema = boardContentSchema
  .extend({ reviewSessions: z.array(reviewSessionSchema).max(MAX_SESSIONS) })
  .superRefine((board, ctx) => {
    checkBoardRelations(board, ctx);
    const noteIds = new Set(board.notes.map((note) => note.id));
    for (const session of board.reviewSessions) {
      const answered = new Set<string>();
      for (const result of session.results) {
        if (!noteIds.has(result.noteId) || answered.has(result.noteId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Niepoprawny wynik powtórki",
          });
        }
        answered.add(result.noteId);
      }
    }
  });

export const backupFileSchema = z.object({
  ...fileHeader,
  kind: z.literal("backup"),
  boards: z.array(backupBoardSchema).max(MAX_BOARDS),
  pegWords: z
    .array(
      z.object({
        number: z.string().regex(/^[0-9]{1,15}$/),
        word: z.string().trim().min(1).max(CUSTOM_PEG_WORD_MAX_LENGTH),
      }),
    )
    .max(110 + MAX_CUSTOM_PEGS)
    .refine((pegWords) => new Set(pegWords.map((peg) => peg.number)).size === pegWords.length, {
      message: "Powtórzone hasła GSP",
    }),
});

export type BoardExportFile = z.infer<typeof boardExportFileSchema>;
export type BackupFile = z.infer<typeof backupFileSchema>;
export type BackupBoard = BackupFile["boards"][number];
