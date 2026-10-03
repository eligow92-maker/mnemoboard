export interface WordImageSegment {
  number: string;
  word: string;
}

export interface GeneratedWordImages {
  segments: WordImageSegment[];
  imageWords: string;
}

// Wyszukuje ciągi cyfr i dzieli każdy na pary od lewej; ostatnia pojedyncza cyfra zostaje osobno.
export function splitDigits(topic: string): string[] {
  return (topic.match(/\d+/g) ?? []).flatMap((run) => run.match(/\d{1,2}/g) ?? []);
}

// Czysta funkcja generatora: (zagadnienie, lista GSP) → słowa-obrazy; null, gdy brak cyfr.
export function generateWordImages(
  topic: string,
  pegWords: ReadonlyMap<string, string>,
): GeneratedWordImages | null {
  const numbers = splitDigits(topic);
  if (numbers.length === 0) return null;

  const segments = numbers.map((number) => ({ number, word: pegWords.get(number) ?? number }));
  return { segments, imageWords: segments.map((segment) => segment.word).join(", ") };
}
