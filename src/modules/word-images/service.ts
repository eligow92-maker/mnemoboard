import { ApiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { DEFAULT_PEG_WORDS } from "./default-peg-words";
import { generateWordImages, type GeneratedWordImages } from "./generator";

// Lista GSP z bazy; brakujące hasła (baza bez seeda) uzupełniane słowami startowymi.
async function loadPegWordMap(): Promise<Map<string, string>> {
  const pegWords = new Map(Object.entries(DEFAULT_PEG_WORDS));
  for (const pegWord of await prisma.pegWord.findMany()) {
    pegWords.set(pegWord.number, pegWord.word);
  }
  return pegWords;
}

export async function generateForTopic(topic: string): Promise<GeneratedWordImages> {
  const generated = generateWordImages(topic, await loadPegWordMap());
  if (!generated) {
    throw new ApiError(422, "NO_DIGITS", "Zagadnienie nie zawiera cyfr");
  }
  return generated;
}
