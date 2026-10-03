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
