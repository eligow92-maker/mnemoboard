import type { PegWord } from "@prisma/client";
import { ApiError, notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import { DEFAULT_PEG_WORDS } from "./default-peg-words";
import { comparePegNumbers } from "./encoding";
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

export interface PegWordView extends PegWord {
  isCustom: boolean;
}

function toPegWordView(pegWord: PegWord): PegWordView {
  return { ...pegWord, isCustom: pegWord.word !== pegWord.defaultWord };
}

export async function listPegWords(): Promise<PegWordView[]> {
  const pegWords = await prisma.pegWord.findMany();
  return pegWords
    .sort((a, b) => comparePegNumbers(a.number, b.number))
    .map((pegWord) => toPegWordView(pegWord));
}

async function requirePegWord(number: string): Promise<PegWord> {
  const pegWord = /^[0-9]{1,2}$/.test(number)
    ? await prisma.pegWord.findUnique({ where: { number } })
    : null;
  if (!pegWord) throw notFound("Hasło nie istnieje");
  return pegWord;
}

export async function updatePegWord(number: string, word: string): Promise<PegWordView> {
  await requirePegWord(number);
  return toPegWordView(await prisma.pegWord.update({ where: { number }, data: { word } }));
}

export async function resetPegWord(number: string): Promise<PegWordView> {
  const pegWord = await requirePegWord(number);
  // Własne wpisy (bez słowa startowego) obsłuży TASK-030; hasła 0–9 i 00–99 zawsze je mają.
  if (pegWord.defaultWord === null) {
    throw new ApiError(409, "PEG_NO_DEFAULT", "Własny wpis nie ma słowa domyślnego");
  }
  return toPegWordView(
    await prisma.pegWord.update({ where: { number }, data: { word: pegWord.defaultWord } }),
  );
}
