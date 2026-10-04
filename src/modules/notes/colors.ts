// Kolory karteczek (US-017): znaczenie nadaje użytkownik, np. ważność.
export const NOTE_COLORS = ["yellow", "red", "orange", "green", "blue"] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];

export const DEFAULT_NOTE_COLOR: NoteColor = "yellow";

// Polskie nazwy kolorów — etykiety dostępności, kolor nie jest jedynym nośnikiem informacji.
export const NOTE_COLOR_LABELS: Record<NoteColor, string> = {
  yellow: "żółty",
  red: "czerwony",
  orange: "pomarańczowy",
  green: "zielony",
  blue: "niebieski",
};
