import { Prisma, type ReviewResult, type ReviewSession } from "@prisma/client";
import { ApiError, notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import { reviewOrder } from "./order";
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

// Karty powtórki: tylko karteczki ze słowami-obrazami, najpierw łańcuchy po kolei, potem reszta
// według daty utworzenia. Kolejność trzyma klient; serwer zapisuje tylko wyniki.
export async function startSession(boardId: string): Promise<ReviewSessionStart> {
  const [notes, chainLinks] = await Promise.all([
    prisma.note.findMany({ where: { boardId }, include: { zone: { select: { name: true } } } }),
    prisma.connection.findMany({
      where: { boardId, kind: "chain" },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const reviewable = new Map(
    notes.filter((note) => (note.imageWords ?? "").trim() !== "").map((note) => [note.id, note]),
  );
  if (reviewable.size === 0) {
    throw new ApiError(422, "NO_REVIEWABLE_NOTES", "Dodaj słowa-obrazy, aby rozpocząć powtórkę");
  }

  const cards = reviewOrder([...reviewable.values()], chainLinks).flatMap((noteId) => {
    const note = reviewable.get(noteId);
    if (!note) return [];
    return [
      {
        noteId: note.id,
        topic: note.topic,
        imageWords: note.imageWords ?? "",
        zoneName: note.zone?.name ?? null,
      },
    ];
  });

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
