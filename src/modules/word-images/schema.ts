import { z } from "zod";
import { NOTE_TEXT_MAX_LENGTH, NOTE_TOPIC_REQUIRED_MESSAGE } from "@/modules/notes/schema";

export const generateSchema = z.object({
  topic: z
    .string({ required_error: NOTE_TOPIC_REQUIRED_MESSAGE })
    .min(1, NOTE_TOPIC_REQUIRED_MESSAGE)
    .max(NOTE_TEXT_MAX_LENGTH, `Zagadnienie może mieć najwyżej ${NOTE_TEXT_MAX_LENGTH} znaków`),
});
