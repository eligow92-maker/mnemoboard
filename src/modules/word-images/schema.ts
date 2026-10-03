import { z } from "zod";
import { NOTE_TEXT_MAX_LENGTH, NOTE_TOPIC_REQUIRED_MESSAGE } from "@/modules/notes/schema";

export const generateSchema = z.object({
  topic: z
    .string({ required_error: NOTE_TOPIC_REQUIRED_MESSAGE })
    .min(1, NOTE_TOPIC_REQUIRED_MESSAGE)
    .max(NOTE_TEXT_MAX_LENGTH, `Zagadnienie może mieć najwyżej ${NOTE_TEXT_MAX_LENGTH} znaków`),
});

export const PEG_WORD_MAX_LENGTH = 40;
export const PEG_WORD_REQUIRED_MESSAGE = "Podaj słowo";

export const pegWordInputSchema = z.object({
  word: z
    .string({ required_error: PEG_WORD_REQUIRED_MESSAGE })
    .trim()
    .min(1, PEG_WORD_REQUIRED_MESSAGE)
    .max(PEG_WORD_MAX_LENGTH, `Słowo może mieć najwyżej ${PEG_WORD_MAX_LENGTH} znaków`),
});
