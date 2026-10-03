import type { Note } from "@prisma/client";
import { notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import { boardChainPositions } from "@/modules/arrangement/connections";
import type { NoteCreateInput, NoteUpdateInput } from "./schema";

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

async function requireNote(noteId: string): Promise<Note> {
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) throw notFound("Karteczka nie istnieje");
  return note;
}

export async function updateNote(noteId: string, input: NoteUpdateInput): Promise<NoteView> {
  await requireNote(noteId);
  const note = await prisma.note.update({
    where: { id: noteId },
    data: { topic: input.topic, imageWords: input.imageWords, x: input.x, y: input.y },
  });
  const positions = await boardChainPositions(note.boardId);
  return toNoteView(note, positions.get(note.id) ?? null);
}

// Połączenia i wyniki powtórek karteczki usuwa baza (ON DELETE CASCADE).
export async function deleteNote(noteId: string): Promise<void> {
  await requireNote(noteId);
  await prisma.note.delete({ where: { id: noteId } });
}
