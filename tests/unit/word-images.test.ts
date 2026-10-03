import { describe, expect, it } from "vitest";
import { generateWordImages, splitDigits } from "@/modules/word-images/generator";

const PEGS = new Map([
  ["0", "osa"],
  ["7", "oko"],
  ["00", "sos"],
  ["07", "sok"],
  ["10", "tuz"],
  ["12", "dynia"],
  ["14", "tor"],
  ["34", "mur"],
  ["56", "olej"],
]);

describe("word-images/generator", () => {
  it.each([
    ["1410", ["14", "10"]],
    ["15.07.1410", ["15", "07", "14", "10"]],
    ["966", ["96", "6"]],
    ["007", ["00", "7"]],
    ["7", ["7"]],
    ["rok 1410, dnia 15/7", ["14", "10", "15", "7"]],
    ["123456", ["12", "34", "56"]],
    ["Mitochondrium", []],
    ["", []],
  ])("dzieli cyfry zagadnienia %s na %j", (topic, expected) => {
    expect(splitDigits(topic)).toEqual(expected);
  });

  it("podstawia słowa z listy i łączy je przecinkami", () => {
    expect(generateWordImages("0 i 123456", PEGS)).toEqual({
      segments: [
        { number: "0", word: "osa" },
        { number: "12", word: "dynia" },
        { number: "34", word: "mur" },
        { number: "56", word: "olej" },
      ],
      imageWords: "osa, dynia, mur, olej",
    });
  });

  it("zwraca null dla zagadnienia bez cyfr", () => {
    expect(generateWordImages("Mitochondrium", PEGS)).toBeNull();
  });

  it("dzieli bardzo długi ciąg cyfr bez gubienia cyfr", () => {
    const digits = "1234567890".repeat(20) + "5";
    const segments = splitDigits(digits);

    expect(segments).toHaveLength(101);
    expect(segments.join("")).toBe(digits);
    expect(segments.at(-1)).toBe("5");
  });
});
