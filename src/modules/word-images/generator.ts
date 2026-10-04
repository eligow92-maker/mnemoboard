export interface WordImageSegment {
  number: string;
  word: string;
  // custom — dopasowany własny wpis; builtin — hasło z listy 0–9 i 00–99.
  source: "builtin" | "custom";
}

export interface GeneratedWordImages {
  segments: WordImageSegment[];
  imageWords: string;
}

// Dzieli fragment cyfr na pary od lewej; ostatnia pojedyncza cyfra zostaje osobno.
function splitIntoPairs(digits: string): string[] {
  return digits.match(/\d{1,2}/g) ?? [];
}

// Dzieli jeden ciąg cyfr: najpierw znajduje własne wpisy od lewej (w tym samym miejscu wygrywa
// najdłuższy), a fragmenty przed, między i za nimi dzieli na pary.
function splitRun(run: string, customNumbers: readonly string[]): string[] {
  const byLength = [...customNumbers].sort((a, b) => b.length - a.length);
  const segments: string[] = [];
  let fragmentStart = 0;
  let position = 0;
  while (position < run.length) {
    const match = byLength.find((number) => run.startsWith(number, position));
    if (!match) {
      position += 1;
      continue;
    }
    segments.push(...splitIntoPairs(run.slice(fragmentStart, position)), match);
    position += match.length;
    fragmentStart = position;
  }
  return [...segments, ...splitIntoPairs(run.slice(fragmentStart))];
}

// Wyszukuje ciągi cyfr i dzieli je na segmenty: własne wpisy, reszta na pary od lewej.
export function splitDigits(topic: string, customNumbers: readonly string[] = []): string[] {
  return (topic.match(/\d+/g) ?? []).flatMap((run) => splitRun(run, customNumbers));
}

// Czysta funkcja generatora: (zagadnienie, hasła wbudowane, własne wpisy) → słowa-obrazy;
// null, gdy brak cyfr.
export function generateWordImages(
  topic: string,
  pegWords: ReadonlyMap<string, string>,
  customPegWords: ReadonlyMap<string, string> = new Map(),
): GeneratedWordImages | null {
  const numbers = splitDigits(topic, [...customPegWords.keys()]);
  if (numbers.length === 0) return null;

  const segments = numbers.map((number): WordImageSegment => {
    const custom = customPegWords.get(number);
    if (custom !== undefined) return { number, word: custom, source: "custom" };
    return { number, word: pegWords.get(number) ?? number, source: "builtin" };
  });
  return { segments, imageWords: segments.map((segment) => segment.word).join(", ") };
}
