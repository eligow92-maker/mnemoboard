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

const coordinate = z.number({ required_error: "Podaj położenie" }).finite();

export const noteCreateSchema = z.object({
  topic,
  imageWords: imageWords.optional(),
  x: coordinate,
  y: coordinate,
});

export type NoteCreateInput = z.infer<typeof noteCreateSchema>;

export const noteUpdateSchema = z
  .object({
    topic: topic.optional(),
    imageWords: imageWords.optional(),
    x: coordinate.optional(),
    y: coordinate.optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Podaj co najmniej jedno pole do zmiany",
  });

export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
