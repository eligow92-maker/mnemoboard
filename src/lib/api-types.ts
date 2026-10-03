// Kształty odpowiedzi API (.prodready/design/api/openapi.yaml) — daty jako tekst ISO.

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
