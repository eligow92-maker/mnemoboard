import { Prisma, type ReviewResult, type ReviewSession } from "@prisma/client";
import { ApiError, notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import type { ReviewResultInput } from "./schema";
import { percent } from "./score";

export interface ReviewCard {
  noteId: string;
  topic: string;
  imageWords: string;
  zoneName: string | null;
}

export interface ReviewSessionStart {
  id: string;
  boardId: string;
  startedAt: Date;
  cards: ReviewCard[];
}

export interface ReviewSummary {
  sessionId: string;
  finishedAt: Date;
  rememberedCount: number;
  totalCount: number;
  percent: number;
}

function sessionFinished(): ApiError {
  return new ApiError(409, "SESSION_FINISHED", "Ta powtórka jest już zakończona");
}

// Kolejność kart jest zwracana przy starcie i trzymana przez klienta; serwer zapisuje tylko wyniki.
export async function startSession(boardId: string): Promise<ReviewSessionStart> {
  const notes = await prisma.note.findMany({ where: { boardId }, orderBy: { createdAt: "asc" } });
  const cards = notes.map((note) => ({
    noteId: note.id,
    topic: note.topic,
    imageWords: note.imageWords ?? "",
    zoneName: null,
  }));

  const session = await prisma.reviewSession.create({ data: { boardId } });
  return { id: session.id, boardId, startedAt: session.startedAt, cards };
}

async function requireOpenSession(sessionId: string): Promise<ReviewSession> {
  const session = await prisma.reviewSession.findUnique({ where: { id: sessionId } });
  if (!session) throw notFound("Powtórka nie istnieje");
  if (session.finishedAt !== null) throw sessionFinished();
  return session;
}

export async function recordResult(
  sessionId: string,
  input: ReviewResultInput,
): Promise<ReviewResult> {
  const session = await requireOpenSession(sessionId);
  const note = await prisma.note.findFirst({
    where: { id: input.noteId, boardId: session.boardId },
  });
  if (!note) throw notFound("Karteczka nie istnieje");

  try {
    // answeredAt ustawia baza — bieżąca data zapisu wyniku.
    return await prisma.reviewResult.create({
      data: { sessionId, noteId: input.noteId, remembered: input.remembered },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError(409, "RESULT_EXISTS", "Ta karteczka została już oceniona");
    }
    throw error;
  }
}

export async function finishSession(sessionId: string): Promise<ReviewSummary> {
  await requireOpenSession(sessionId);
  const session = await prisma.reviewSession.update({
    where: { id: sessionId },
    data: { finishedAt: new Date() },
    include: { results: { select: { remembered: true } } },
  });

  const totalCount = session.results.length;
  const rememberedCount = session.results.filter((result) => result.remembered).length;
  return {
    sessionId,
    finishedAt: session.finishedAt ?? new Date(),
    rememberedCount,
    totalCount,
    percent: percent(rememberedCount, totalCount),
  };
}
