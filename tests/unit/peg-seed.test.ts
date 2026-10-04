import { describe, expect, it } from "vitest";
import { DEFAULT_PEG_WORDS } from "@/modules/word-images/default-peg-words";
import { decodeWord, PEG_NUMBERS } from "@/modules/word-images/encoding";

describe("TASK-008 Startowa lista GSP i seed", () => {
  it("AC-2: spółgłoski każdego słowa startowej listy GSP dekodują się do liczby hasła", () => {
    expect(PEG_NUMBERS).toHaveLength(110);
    const mismatches = PEG_NUMBERS.filter(
      (number) => decodeWord(DEFAULT_PEG_WORDS[number] ?? "") !== number,
    ).map((number) => `${number} → ${DEFAULT_PEG_WORDS[number]}`);

    expect(mismatches).toEqual([]);
  });

  it("lista haseł to 0–9 oraz 00–99, razem 110, bez powtórzonych słów", () => {
    expect(PEG_NUMBERS).toHaveLength(110);
    expect(PEG_NUMBERS.slice(0, 11)).toEqual([
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "00",
    ]);
    expect(PEG_NUMBERS.at(-1)).toBe("99");
    expect(Object.keys(DEFAULT_PEG_WORDS).sort()).toEqual([...PEG_NUMBERS].sort());
    const words = Object.values(DEFAULT_PEG_WORDS).map((word) => word.toLowerCase());
    expect(new Set(words).size).toBe(110);
  });

  it.each([
    ["tor", "14"],
    ["tur", "14"],
    ["dos", "10"],
    ["Mama", "33"],
    ["jajo", "66"],
    ["sól", "05"],
    ["dąb", "19"],
    ["oko", "7"],
    ["aua", ""],
    ["jeż", "6"],
    ["chata", "1"],
  ])("dekoduje słowo %s jako %s", (word, expected) => {
    expect(decodeWord(word)).toBe(expected);
  });
});
