import type { Note } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { NoteCreateInput } from "./schema";

// Karteczka w kształcie odpowiedzi API: z wyliczanym numerem w łańcuchu.
export interface NoteView extends Note {
  chainPosition: number | null;
}

export function toNoteView(note: Note, chainPosition: number | null = null): NoteView {
  return { ...note, chainPosition };
}

export async function createNote(boardId: string, input: NoteCreateInput): Promise<NoteView> {
  const note = await prisma.note.create({
    data: {
      boardId,
      topic: input.topic,
      imageWords: input.imageWords ?? null,
      x: input.x,
      y: input.y,
    },
  });
  return toNoteView(note);
}
