import type { PegWord } from "@prisma/client";
import { ApiError, notFound } from "@/lib/api";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { DEFAULT_PEG_WORDS } from "./default-peg-words";
import { comparePegNumbers } from "./encoding";
import { generateWordImages, type GeneratedWordImages } from "./generator";
import { CUSTOM_PEG_MAX_COUNT, PEG_WORD_MAX_LENGTH } from "./schema";

// Lista GSP z bazy: hasła wbudowane (brakujące, np. w bazie bez seeda, uzupełniane słowami
// startowymi) oraz własne wpisy użytkownika (bez słowa startowego).
async function loadPegWordMaps(): Promise<{
  builtin: Map<string, string>;
  custom: Map<string, string>;
}> {
  const builtin = new Map(Object.entries(DEFAULT_PEG_WORDS));
  const custom = new Map<string, string>();
  for (const pegWord of await prisma.pegWord.findMany()) {
    (pegWord.defaultWord === null ? custom : builtin).set(pegWord.number, pegWord.word);
  }
  return { builtin, custom };
}

export async function generateForTopic(topic: string): Promise<GeneratedWordImages> {
  const { builtin, custom } = await loadPegWordMaps();
  const generated = generateWordImages(topic, builtin, custom);
  if (!generated) {
    throw new ApiError(422, "NO_DIGITS", "Zagadnienie nie zawiera cyfr");
  }
  return generated;
}

export interface PegWordView extends PegWord {
  // builtin — jedno ze 110 haseł; custom — własny wpis użytkownika (3–15 cyfr).
  kind: "builtin" | "custom";
  // Hasło wbudowane ze zmienionym słowem albo własny wpis (zawsze).
  isCustom: boolean;
}

function toPegWordView(pegWord: PegWord): PegWordView {
  const custom = pegWord.defaultWord === null;
  return {
    ...pegWord,
    kind: custom ? "custom" : "builtin",
    isCustom: custom || pegWord.word !== pegWord.defaultWord,
  };
}

// Najpierw hasła wbudowane (0–9, 00–99), potem własne wpisy według długości i wartości.
export async function listPegWords(): Promise<PegWordView[]> {
  const pegWords = await prisma.pegWord.findMany();
  return pegWords
    .map((pegWord) => toPegWordView(pegWord))
    .sort(
      (a, b) =>
        Number(a.kind === "custom") - Number(b.kind === "custom") ||
        comparePegNumbers(a.number, b.number),
    );
}

async function requirePegWord(number: string): Promise<PegWord> {
  const pegWord = /^[0-9]{1,15}$/.test(number)
    ? await prisma.pegWord.findUnique({ where: { number } })
    : null;
  if (!pegWord) throw notFound("Hasło nie istnieje");
  return pegWord;
}

export async function updatePegWord(number: string, word: string): Promise<PegWordView> {
  const pegWord = await requirePegWord(number);
  if (pegWord.defaultWord !== null && word.length > PEG_WORD_MAX_LENGTH) {
    throw new ApiError(400, "VALIDATION_ERROR", "Niepoprawne dane", {
      word: `Słowo może mieć najwyżej ${PEG_WORD_MAX_LENGTH} znaków`,
    });
  }
  return toPegWordView(await prisma.pegWord.update({ where: { number }, data: { word } }));
}

export async function createPegWord(number: string, word: string): Promise<PegWordView> {
  const exists = () => new ApiError(409, "PEG_EXISTS", "Wpis dla tej liczby już istnieje");
  if (await prisma.pegWord.findUnique({ where: { number } })) throw exists();
  if ((await prisma.pegWord.count({ where: { defaultWord: null } })) >= CUSTOM_PEG_MAX_COUNT) {
    throw new ApiError(
      409,
      "PEG_LIMIT",
      `Możesz mieć najwyżej ${CUSTOM_PEG_MAX_COUNT} własnych wpisów`,
    );
  }
  try {
    return toPegWordView(await prisma.pegWord.create({ data: { number, word } }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw exists();
    }
    throw error;
  }
}

export async function deletePegWord(number: string): Promise<void> {
  const pegWord = await requirePegWord(number);
  if (pegWord.defaultWord !== null) {
    throw new ApiError(409, "PEG_BUILTIN", "Hasła wbudowanego nie można usunąć");
  }
  await prisma.pegWord.delete({ where: { number } });
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
