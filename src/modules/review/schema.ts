import { z } from "zod";
import { NOTE_COLORS } from "@/modules/notes/colors";

export const reviewResultSchema = z.object({
  noteId: z.string().uuid("Niepoprawny identyfikator karteczki"),
  remembered: z.boolean({ required_error: "Podaj wynik", invalid_type_error: "Podaj wynik" }),
});

// Ciało opcjonalne: brak ciała lub brak pola `colors` oznacza wszystkie kolory.
export const startSessionSchema = z
  .object({
    colors: z
      .array(z.enum(NOTE_COLORS, { errorMap: () => ({ message: "Nieznany kolor karteczki" }) }))
      .min(1, "Wybierz co najmniej jeden kolor")
      .refine((colors) => new Set(colors).size === colors.length, "Kolory nie mogą się powtarzać")
      .optional(),
  })
  .optional();

export type StartSessionInput = z.infer<typeof startSessionSchema>;

export type ReviewResultInput = z.infer<typeof reviewResultSchema>;
