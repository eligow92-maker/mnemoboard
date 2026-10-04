import type { NoteColor } from "@/modules/notes/colors";

// Klasy w pełnych, statycznych napisach, żeby Tailwind je wykrył.
export const NOTE_COLOR_CLASSES: Record<NoteColor, string> = {
  yellow: "bg-note-yellow border-note-yellow-border",
  red: "bg-note-red border-note-red-border",
  orange: "bg-note-orange border-note-orange-border",
  green: "bg-note-green border-note-green-border",
  blue: "bg-note-blue border-note-blue-border",
};
