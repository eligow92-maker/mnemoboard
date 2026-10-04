// Kolory karteczek (US-017): znaczenie nadaje użytkownik, np. ważność.
export const NOTE_COLORS = ["yellow", "red", "orange", "green", "blue"] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];

export function isNoteColor(value: string): value is NoteColor {
  return (NOTE_COLORS as readonly string[]).includes(value);
}

// Kolory z adresu (?colors=red,blue); nieznane wartości są pomijane, brak poprawnych = wszystkie.
export function parseColorsParam(value: string | undefined): NoteColor[] | undefined {
  const colors = (value ?? "").split(",").filter(isNoteColor);
  return colors.length > 0 ? [...new Set(colors)] : undefined;
}

export const DEFAULT_NOTE_COLOR: NoteColor = "yellow";

// Polskie nazwy kolorów — etykiety dostępności, kolor nie jest jedynym nośnikiem informacji.
export const NOTE_COLOR_LABELS: Record<NoteColor, string> = {
  yellow: "żółty",
  red: "czerwony",
  orange: "pomarańczowy",
  green: "zielony",
  blue: "niebieski",
};
