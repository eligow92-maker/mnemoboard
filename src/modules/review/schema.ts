import { z } from "zod";

export const reviewResultSchema = z.object({
  noteId: z.string().uuid("Niepoprawny identyfikator karteczki"),
  remembered: z.boolean({ required_error: "Podaj wynik", invalid_type_error: "Podaj wynik" }),
});

export type ReviewResultInput = z.infer<typeof reviewResultSchema>;
