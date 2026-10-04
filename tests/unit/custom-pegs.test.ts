import { describe, expect, it } from "vitest";
import { generateWordImages, splitDigits } from "@/modules/word-images/generator";

describe("TASK-029 Dopasowanie własnych wpisów w generatorze", () => {
  it('AC-1: dla własnego wpisu "333" ciąg cyfr "48333" dzieli się kolejno na "48" i "333"', () => {
    expect(splitDigits("48333", ["333"])).toEqual(["48", "333"]);
  });

  it('AC-2: dla własnych wpisów "333" i "3334" ciąg cyfr "3334" daje jeden segment "3334"', () => {
    expect(splitDigits("3334", ["333", "3334"])).toEqual(["3334"]);
  });

  it('AC-3: dla własnego wpisu "333" ciąg cyfr "3331333" dzieli się kolejno na "333", "1" i "333"', () => {
    expect(splitDigits("3331333", ["333"])).toEqual(["333", "1", "333"]);
  });

  it("własny wpis nie przekracza granicy ciągu cyfr rozdzielonego separatorem", () => {
    expect(splitDigits("33-3", ["333"])).toEqual(["33", "3"]);
  });

  it("fragment przed własnym wpisem o nieparzystej długości kończy się pojedynczą cyfrą", () => {
    expect(splitDigits("4333", ["333"])).toEqual(["4", "333"]);
  });

  it("bez własnych wpisów podział na pary jest taki jak dotąd", () => {
    expect(splitDigits("333")).toEqual(["33", "3"]);
    expect(splitDigits("333", [])).toEqual(["33", "3"]);
  });

  it("własny wpis 15-cyfrowy obejmuje cały numer", () => {
    const number = "123456789012345";
    expect(splitDigits(number, [number])).toEqual([number]);
  });

  it("generator oznacza segmenty źródłem: własny wpis albo hasło wbudowane", () => {
    const generated = generateWordImages(
      "48333",
      new Map([["48", "rafa"]]),
      new Map([["333", "mumia-mysz"]]),
    );

    expect(generated).toEqual({
      segments: [
        { number: "48", word: "rafa", source: "builtin" },
        { number: "333", word: "mumia-mysz", source: "custom" },
      ],
      imageWords: "rafa, mumia-mysz",
    });
  });
});
