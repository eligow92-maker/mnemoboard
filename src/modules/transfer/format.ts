import type { NoteColor } from "@/modules/notes/colors";
import {
  FILE_FORMAT,
  FILE_VERSION,
  backupFileSchema,
  boardExportFileSchema,
  type BackupFile,
  type BoardExportFile,
} from "./schema";

export type ParseResult<T> = { success: true; data: T } | { success: false; message: string };

// Plansza w kształcie wejściowym serializacji — pasuje do wierszy bazy z dodatkowymi polami.
export interface BoardSource {
  name: string;
  createdAt: Date;
  notes: {
    id: string;
    zoneId: string | null;
    topic: string;
    imageWords: string | null;
    story: string | null;
    emoji: string | null;
    color: NoteColor;
    x: number;
    y: number;
    createdAt: Date;
  }[];
  zones: {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    createdAt: Date;
  }[];
  connections: { sourceNoteId: string; targetNoteId: string; kind: "association" | "chain" }[];
}

// Wybiera pola jawnie, żeby do pliku nie trafiło nic poza kontraktem (np. identyfikator planszy).
export function serializeBoard(source: BoardSource): BoardExportFile["board"] {
  return {
    name: source.name,
    createdAt: source.createdAt.toISOString(),
    notes: source.notes.map((note) => ({
      id: note.id,
      zoneId: note.zoneId,
      topic: note.topic,
      imageWords: note.imageWords,
      story: note.story,
      emoji: note.emoji,
      color: note.color,
      x: note.x,
      y: note.y,
      createdAt: note.createdAt.toISOString(),
    })),
    zones: source.zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
      createdAt: zone.createdAt.toISOString(),
    })),
    connections: source.connections.map(({ sourceNoteId, targetNoteId, kind }) => ({
      sourceNoteId,
      targetNoteId,
      kind,
    })),
  };
}

export function buildBoardExportFile(source: BoardSource, now: Date): BoardExportFile {
  return {
    format: FILE_FORMAT,
    version: FILE_VERSION,
    kind: "board",
    exportedAt: now.toISOString(),
    board: serializeBoard(source),
  };
}

function parse<T>(
  schema: { safeParse: (input: unknown) => { success: boolean; data?: T; error?: Error } },
  input: unknown,
): ParseResult<T> {
  const result = schema.safeParse(input);
  if (result.success) return { success: true, data: result.data as T };
  return { success: false, message: result.error?.message ?? "Niepoprawny plik" };
}

export const parseBoardExportFile = (input: unknown): ParseResult<BoardExportFile> =>
  parse(boardExportFileSchema, input);

export const parseBackupFile = (input: unknown): ParseResult<BackupFile> =>
  parse(backupFileSchema, input);

// Nazwa pliku bez polskich znaków i znaków specjalnych, np. "zolta-historia-polski".
function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug === "" ? "plansza" : slug;
}

const day = (date: Date): string => date.toISOString().slice(0, 10);

export const exportFileName = (boardName: string, date: Date): string =>
  `mnemoboard-${slugify(boardName)}-${day(date)}.json`;

export const backupFileName = (date: Date): string => `mnemoboard-kopia-${day(date)}.json`;
