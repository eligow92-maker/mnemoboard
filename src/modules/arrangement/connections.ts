import { Prisma, type Connection } from "@prisma/client";
import { ApiError, notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import { CHAIN_VIOLATION_MESSAGES, chainPositions, validateChainLink } from "./chain";
import type { ConnectionCreateInput } from "./schema";

function connectionExists(): ApiError {
  return new ApiError(409, "CONNECTION_EXISTS", "Te karteczki są już połączone");
}

function chainLinks(boardId: string): Promise<Connection[]> {
  return prisma.connection.findMany({
    where: { boardId, kind: "chain" },
    orderBy: { createdAt: "asc" },
  });
}

// Numer w łańcuchu każdej karteczki planszy należącej do łańcucha.
export async function boardChainPositions(boardId: string): Promise<Map<string, number>> {
  return chainPositions(await chainLinks(boardId));
}

export async function createConnection(
  boardId: string,
  input: ConnectionCreateInput,
): Promise<Connection> {
  const { sourceNoteId, targetNoteId, kind } = input;
  const notes = await prisma.note.count({
    where: { boardId, id: { in: [sourceNoteId, targetNoteId] } },
  });
  if (notes !== 2) throw notFound("Karteczka nie istnieje");

  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { sourceNoteId, targetNoteId },
        { sourceNoteId: targetNoteId, targetNoteId: sourceNoteId },
      ],
    },
  });
  if (existing) throw connectionExists();

  if (kind === "chain") {
    const violation = validateChainLink(await chainLinks(boardId), sourceNoteId, targetNoteId);
    if (violation) throw new ApiError(409, violation, CHAIN_VIOLATION_MESSAGES[violation]);
  }

  try {
    return await prisma.connection.create({ data: { boardId, sourceNoteId, targetNoteId, kind } });
  } catch (error) {
    // Równoległe żądanie mogło utworzyć połączenie między sprawdzeniem a zapisem.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw connectionExists();
    }
    throw error;
  }
}

export async function deleteConnection(connectionId: string): Promise<void> {
  const { count } = await prisma.connection.deleteMany({ where: { id: connectionId } });
  if (count === 0) throw notFound("Połączenie nie istnieje");
}
