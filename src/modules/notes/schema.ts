import { z } from "zod";

export const NOTE_TEXT_MAX_LENGTH = 500;
export const NOTE_TOPIC_REQUIRED_MESSAGE = "Wpisz zagadnienie";

const topic = z
  .string({ required_error: NOTE_TOPIC_REQUIRED_MESSAGE })
  .trim()
  .min(1, NOTE_TOPIC_REQUIRED_MESSAGE)
  .max(NOTE_TEXT_MAX_LENGTH, `Zagadnienie może mieć najwyżej ${NOTE_TEXT_MAX_LENGTH} znaków`);

// Puste słowa-obrazy zapisujemy jako brak wartości.
const imageWords = z
  .string()
  .trim()
  .max(NOTE_TEXT_MAX_LENGTH, `Słowa-obrazy mogą mieć najwyżej ${NOTE_TEXT_MAX_LENGTH} znaków`)
  .transform((value) => (value === "" ? null : value))
  .nullable();

export const NOTE_STORY_MAX_LENGTH = 2000;

// Puste opowiadanie zapisujemy jako brak wartości.
const story = z
  .string()
  .trim()
  .max(NOTE_STORY_MAX_LENGTH, `Opowiadanie może mieć najwyżej ${NOTE_STORY_MAX_LENGTH} znaków`)
  .transform((value) => (value === "" ? null : value))
  .nullable();

export const NOTE_EMOJI_MAX_COUNT = 8;
export const NOTE_EMOJI_TOO_MANY_MESSAGE = `Najwyżej ${NOTE_EMOJI_MAX_COUNT} emotek`;
// Kolumna ma 64 znaki; limit 8 liczymy w znakach graficznych (ADR-006), więc złożone emotki
// (flagi, odcienie skóry, sekwencje ZWJ) liczą się jako jedna.
const EMOJI_COLUMN_MAX_LENGTH = 64;
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function countGraphemes(value: string): number {
  return [...graphemes.segment(value)].length;
}

// Puste emotki zapisujemy jako brak wartości.
const emoji = z
  .string()
  .trim()
  .refine(
    (value) =>
      countGraphemes(value) <= NOTE_EMOJI_MAX_COUNT && value.length <= EMOJI_COLUMN_MAX_LENGTH,
    NOTE_EMOJI_TOO_MANY_MESSAGE,
  )
  .transform((value) => (value === "" ? null : value))
  .nullable();

const coordinate = z.number({ required_error: "Podaj położenie" }).finite();

export const noteCreateSchema = z.object({
  topic,
  imageWords: imageWords.optional(),
  story: story.optional(),
  emoji: emoji.optional(),
  x: coordinate,
  y: coordinate,
});

export type NoteCreateInput = z.infer<typeof noteCreateSchema>;

export const noteUpdateSchema = z
  .object({
    topic: topic.optional(),
    imageWords: imageWords.optional(),
    story: story.optional(),
    emoji: emoji.optional(),
    x: coordinate.optional(),
    y: coordinate.optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Podaj co najmniej jedno pole do zmiany",
  });

export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
