import { z } from "zod";

export const connectionCreateSchema = z
  .object({
    sourceNoteId: z.string().uuid("Niepoprawny identyfikator karteczki"),
    targetNoteId: z.string().uuid("Niepoprawny identyfikator karteczki"),
    kind: z.enum(["association", "chain"]),
  })
  .refine((value) => value.sourceNoteId !== value.targetNoteId, {
    message: "Nie można połączyć karteczki z samą sobą",
    path: ["targetNoteId"],
  });

export type ConnectionCreateInput = z.infer<typeof connectionCreateSchema>;
