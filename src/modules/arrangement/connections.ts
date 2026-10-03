import { Prisma, type Connection } from "@prisma/client";
import { ApiError, notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import type { ConnectionCreateInput } from "./schema";

function connectionExists(): ApiError {
  return new ApiError(409, "CONNECTION_EXISTS", "Te karteczki są już połączone");
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
