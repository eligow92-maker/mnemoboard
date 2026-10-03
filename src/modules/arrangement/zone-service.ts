import type { Zone } from "@prisma/client";
import { notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import type { ZoneCreateInput, ZoneUpdateInput } from "./schema";
import { assignZones, zoneForNote } from "./zones";

export interface ZoneWithNotes extends Zone {
  // Karteczki przypisane do strefy po przeliczeniu.
  noteIds: string[];
}

// Pokój dla karteczki o podanym położeniu (lewy górny róg) na danej planszy.
export async function zoneIdForPosition(
  boardId: string,
  x: number,
  y: number,
): Promise<string | null> {
  const zones = await prisma.zone.findMany({ where: { boardId } });
  return zoneForNote({ id: "", x, y }, zones);
}

// Przelicza przypisania wszystkich karteczek planszy; zapisuje tylko te, które się zmieniły.
async function recalculateBoardZones(boardId: string): Promise<void> {
  const [notes, zones] = await Promise.all([
    prisma.note.findMany({
      where: { boardId },
      select: { id: true, x: true, y: true, zoneId: true },
    }),
    prisma.zone.findMany({ where: { boardId } }),
  ]);
  const assignments = assignZones(notes, zones);
  const changed = notes.filter((note) => (assignments.get(note.id) ?? null) !== note.zoneId);
  if (changed.length === 0) return;

  await prisma.$transaction(
    changed.map((note) =>
      prisma.note.update({
        where: { id: note.id },
        data: { zoneId: assignments.get(note.id) ?? null },
      }),
    ),
  );
}

async function withNotes(zone: Zone): Promise<ZoneWithNotes> {
  const notes = await prisma.note.findMany({
    where: { zoneId: zone.id },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return { ...zone, noteIds: notes.map((note) => note.id) };
}

async function requireZone(zoneId: string): Promise<Zone> {
  const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
  if (!zone) throw notFound("Pokój nie istnieje");
  return zone;
}

export async function createZone(boardId: string, input: ZoneCreateInput): Promise<ZoneWithNotes> {
  const zone = await prisma.zone.create({ data: { boardId, ...input } });
  await recalculateBoardZones(boardId);
  return withNotes(zone);
}

export async function updateZone(zoneId: string, input: ZoneUpdateInput): Promise<ZoneWithNotes> {
  await requireZone(zoneId);
  const zone = await prisma.zone.update({ where: { id: zoneId }, data: input });
  await recalculateBoardZones(zone.boardId);
  return withNotes(zone);
}

// Karteczki zostają na planszy; te spod nakładającej się strefy trafiają do niej po przeliczeniu.
export async function deleteZone(zoneId: string): Promise<void> {
  const zone = await requireZone(zoneId);
  await prisma.zone.delete({ where: { id: zoneId } });
  await recalculateBoardZones(zone.boardId);
}
