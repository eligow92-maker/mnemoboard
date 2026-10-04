// Kształty odpowiedzi API (.prodready/design/api/openapi.yaml) — daty jako tekst ISO.

import type { NoteColor } from "@/modules/notes/colors";

export interface BoardDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LastReviewDto {
  finishedAt: string;
  rememberedCount: number;
  totalCount: number;
  percent: number;
}

export interface BoardSummaryDto extends BoardDto {
  noteCount: number;
  lastReview: LastReviewDto | null;
}

export interface NoteDto {
  id: string;
  boardId: string;
  zoneId: string | null;
  topic: string;
  imageWords: string | null;
  story: string | null;
  emoji: string | null;
  color: NoteColor;
  x: number;
  y: number;
  chainPosition: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ZoneDto {
  id: string;
  boardId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export type ConnectionKind = "association" | "chain";

export interface ConnectionDto {
  id: string;
  boardId: string;
  sourceNoteId: string;
  targetNoteId: string;
  kind: ConnectionKind;
  createdAt: string;
}

export interface BoardDetailDto extends BoardDto {
  notes: NoteDto[];
  zones: ZoneDto[];
  connections: ConnectionDto[];
}

export interface GeneratedWordImagesDto {
  segments: { number: string; word: string }[];
  imageWords: string;
}

export interface PegWordDto {
  number: string;
  word: string;
  defaultWord: string | null;
  kind: "builtin" | "custom";
  isCustom: boolean;
  updatedAt: string;
}

export interface ReviewCardDto {
  noteId: string;
  topic: string;
  imageWords: string;
  story: string | null;
  emoji: string | null;
  color: NoteColor;
  zoneName: string | null;
}

export interface ReviewSessionStartDto {
  id: string;
  boardId: string;
  startedAt: string;
  cards: ReviewCardDto[];
}

export interface ReviewSummaryDto {
  sessionId: string;
  finishedAt: string;
  rememberedCount: number;
  totalCount: number;
  percent: number;
}

export interface StatsDto {
  sessionsLast7Days: number;
}
