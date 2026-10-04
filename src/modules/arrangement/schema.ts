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

export const ZONE_NAME_MAX_LENGTH = 60;
export const ZONE_NAME_REQUIRED_MESSAGE = "Podaj nazwę pokoju";

const zoneName = z
  .string({ required_error: ZONE_NAME_REQUIRED_MESSAGE })
  .trim()
  .min(1, ZONE_NAME_REQUIRED_MESSAGE)
  .max(ZONE_NAME_MAX_LENGTH, `Nazwa może mieć najwyżej ${ZONE_NAME_MAX_LENGTH} znaków`);
const zoneCoordinate = z.number().finite();
const zoneSize = z.number().finite().positive("Rozmiar strefy musi być większy od zera");

export const zoneCreateSchema = z.object({
  name: zoneName,
  x: zoneCoordinate,
  y: zoneCoordinate,
  width: zoneSize,
  height: zoneSize,
});

export const zoneUpdateSchema = zoneCreateSchema
  .partial()
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Podaj co najmniej jedno pole do zmiany",
  });

export type ZoneCreateInput = z.infer<typeof zoneCreateSchema>;
export type ZoneUpdateInput = z.infer<typeof zoneUpdateSchema>;
