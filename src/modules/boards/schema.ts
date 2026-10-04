import { z } from "zod";

export const BOARD_NAME_MAX_LENGTH = 100;
export const BOARD_NAME_REQUIRED_MESSAGE = "Podaj nazwę planszy";

export const boardInputSchema = z.object({
  name: z
    .string({ required_error: BOARD_NAME_REQUIRED_MESSAGE })
    .trim()
    .min(1, BOARD_NAME_REQUIRED_MESSAGE)
    .max(BOARD_NAME_MAX_LENGTH, `Nazwa może mieć najwyżej ${BOARD_NAME_MAX_LENGTH} znaków`),
});

export type BoardInput = z.infer<typeof boardInputSchema>;
