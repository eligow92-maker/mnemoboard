import { z } from "zod";
import { NOTE_TEXT_MAX_LENGTH, NOTE_TOPIC_REQUIRED_MESSAGE } from "@/modules/notes/schema";

export const generateSchema = z.object({
  topic: z
    .string({ required_error: NOTE_TOPIC_REQUIRED_MESSAGE })
    .min(1, NOTE_TOPIC_REQUIRED_MESSAGE)
    .max(NOTE_TEXT_MAX_LENGTH, `Zagadnienie może mieć najwyżej ${NOTE_TEXT_MAX_LENGTH} znaków`),
});

// Hasła wbudowane (0–9, 00–99) mają słowa do 40 znaków, własne wpisy (3–15 cyfr) do 80.
export const PEG_WORD_MAX_LENGTH = 40;
export const CUSTOM_PEG_WORD_MAX_LENGTH = 80;
export const CUSTOM_PEG_MAX_COUNT = 500;
export const PEG_WORD_REQUIRED_MESSAGE = "Podaj słowo";
export const CUSTOM_PEG_NUMBER_MESSAGE = "Własny wpis musi mieć od 3 do 15 cyfr";

const word = z
  .string({ required_error: PEG_WORD_REQUIRED_MESSAGE })
  .trim()
  .min(1, PEG_WORD_REQUIRED_MESSAGE)
  .max(CUSTOM_PEG_WORD_MAX_LENGTH, `Słowo może mieć najwyżej ${CUSTOM_PEG_WORD_MAX_LENGTH} znaków`);

export const pegWordInputSchema = z.object({ word });

export const customPegInputSchema = z.object({
  number: z
    .string({ required_error: CUSTOM_PEG_NUMBER_MESSAGE })
    .trim()
    .regex(/^[0-9]{3,15}$/, CUSTOM_PEG_NUMBER_MESSAGE),
  word,
});

export type CustomPegInput = z.infer<typeof customPegInputSchema>;
