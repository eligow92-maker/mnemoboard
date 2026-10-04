import { NOTE_HEIGHT, NOTE_WIDTH } from "./note-size";

// Czysta geometria stref-pokojów: karteczka należy do strefy, w której leży jej środek.

export interface ZoneArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: Date;
}

export interface NotePlacement {
  id: string;
  x: number;
  y: number;
}

function contains(zone: ZoneArea, x: number, y: number): boolean {
  return x >= zone.x && x <= zone.x + zone.width && y >= zone.y && y <= zone.y + zone.height;
}

// Strefa karteczki; przy nakładających się strefach wygrywa utworzona najpóźniej. Krawędź należy do strefy.
export function zoneForNote(note: NotePlacement, zones: ZoneArea[]): string | null {
  const centerX = note.x + NOTE_WIDTH / 2;
  const centerY = note.y + NOTE_HEIGHT / 2;

  let latest: ZoneArea | null = null;
  for (const zone of zones) {
    if (!contains(zone, centerX, centerY)) continue;
    if (latest === null || zone.createdAt.getTime() >= latest.createdAt.getTime()) latest = zone;
  }
  return latest?.id ?? null;
}

// Przypisania wszystkich karteczek planszy — jedno przejście po karteczkach (≤ 200).
export function assignZones(notes: NotePlacement[], zones: ZoneArea[]): Map<string, string | null> {
  return new Map(notes.map((note) => [note.id, zoneForNote(note, zones)]));
}
