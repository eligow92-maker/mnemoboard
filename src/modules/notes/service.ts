import type { Note } from "@prisma/client";
import { notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import { boardChainPositions } from "@/modules/arrangement/connections";
import { zoneIdForPosition } from "@/modules/arrangement/zone-service";
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
      story: input.story ?? null,
      emoji: input.emoji ?? null,
      color: input.color,
      x: input.x,
      y: input.y,
      zoneId: await zoneIdForPosition(boardId, input.x, input.y),
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
  const current = await requireNote(noteId);
  // Po zmianie położenia serwer wylicza pokój od nowa (środek karteczki wewnątrz strefy).
  const moved = input.x !== undefined || input.y !== undefined;
  const x = input.x ?? current.x;
  const y = input.y ?? current.y;
  const note = await prisma.note.update({
    where: { id: noteId },
    data: {
      topic: input.topic,
      imageWords: input.imageWords,
      story: input.story,
      emoji: input.emoji,
      color: input.color,
      x,
      y,
      zoneId: moved ? await zoneIdForPosition(current.boardId, x, y) : undefined,
    },
  });
  const positions = await boardChainPositions(note.boardId);
  return toNoteView(note, positions.get(note.id) ?? null);
}

// Połączenia i wyniki powtórek karteczki usuwa baza (ON DELETE CASCADE).
export async function deleteNote(noteId: string): Promise<void> {
  await requireNote(noteId);
  await prisma.note.delete({ where: { id: noteId } });
}
