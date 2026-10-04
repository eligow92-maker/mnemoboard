import type { PrismaClient } from "@prisma/client";
import { DEFAULT_PEG_WORDS } from "./default-peg-words";
import { PEG_NUMBERS } from "./encoding";

// Idempotentny seed listy GSP: uzupełnia brakujące hasła i aktualizuje słowa startowe,
// ale nigdy nie nadpisuje słowa zmienionego przez użytkownika.
export async function seedPegWords(prisma: PrismaClient): Promise<void> {
  const existing = new Map(
    (await prisma.pegWord.findMany()).map((pegWord) => [pegWord.number, pegWord]),
  );

  await prisma.$transaction(
    PEG_NUMBERS.flatMap((number) => {
      const defaultWord = DEFAULT_PEG_WORDS[number];
      const current = existing.get(number);
      if (!current) {
        return [prisma.pegWord.create({ data: { number, word: defaultWord, defaultWord } })];
      }
      if (current.defaultWord === defaultWord) return [];
      const isCustom = current.word !== current.defaultWord;
      return [
        prisma.pegWord.update({
          where: { number },
          data: { defaultWord, word: isCustom ? current.word : defaultWord },
        }),
      ];
    }),
  );
}
