// Główny System Pamięciowy (GSP): każda cyfra ma swoje spółgłoski; samogłoski i pozostałe
// litery (np. h, ł, c, ż) nie kodują niczego i są pomijane.
export const DIGIT_CONSONANTS: Record<string, readonly string[]> = {
  "0": ["s", "z"],
  "1": ["t", "d"],
  "2": ["n"],
  "3": ["m"],
  "4": ["r"],
  "5": ["l"],
  "6": ["j"],
  "7": ["k", "g"],
  "8": ["f", "w"],
  "9": ["p", "b"],
};

const CONSONANT_DIGITS = new Map<string, string>(
  Object.entries(DIGIT_CONSONANTS).flatMap(([digit, consonants]) =>
    consonants.map((consonant) => [consonant, digit] as const),
  ),
);

// Hasła listy GSP w kolejności wyświetlania: najpierw 0–9, potem 00–99.
export const PEG_NUMBERS: string[] = [
  ...Array.from({ length: 10 }, (_, digit) => String(digit)),
  ...Array.from({ length: 100 }, (_, value) => String(value).padStart(2, "0")),
];

// Zamienia słowo na ciąg cyfr, które kodują jego spółgłoski, np. "tor" → "14".
export function decodeWord(word: string): string {
  return Array.from(word.toLowerCase())
    .map((letter) => CONSONANT_DIGITS.get(letter) ?? "")
    .join("");
}

// Porządek listy GSP: krótsze hasła (0–9) przed dłuższymi (00–99), w obrębie długości rosnąco.
export function comparePegNumbers(a: string, b: string): number {
  return a.length - b.length || a.localeCompare(b);
}
