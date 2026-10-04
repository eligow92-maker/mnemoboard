import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PegWordsScreen } from "@/components/peg-words/peg-words-screen";
import type { GeneratedWordImagesDto } from "@/lib/api-types";
import { prisma } from "@/lib/db";
import { DEFAULT_PEG_WORDS } from "@/modules/word-images/default-peg-words";
import { seedPegWords } from "@/modules/word-images/seed";
import { apiFetch, apiJson, installApiFetch } from "../helpers/api-fetch";

async function findRow(number: string): Promise<HTMLElement> {
  return screen.findByRole("row", { name: new RegExp(`^Hasło ${number}$`) });
}

describe("TASK-009 US-007 Edytowalna lista słów GSP", () => {
  beforeEach(async () => {
    await prisma.pegWord.deleteMany();
    await seedPegWords(prisma);
    installApiFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-1: lista GSP świeżo zainstalowanej aplikacji pokazuje niepuste słowo dla każdego z 110 haseł (0–9 oraz 00–99)", async () => {
    render(<PegWordsScreen />);

    await findRow("0");
    const rows = screen.getAllByRole("row").filter((row) => row.hasAttribute("data-peg-number"));
    expect(rows).toHaveLength(110);
    expect(rows.map((row) => row.getAttribute("data-peg-number")).slice(0, 12)).toEqual([
      ...["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      ...["00", "01"],
    ]);
    const emptyWords = rows.filter(
      (row) => (within(row).getByRole("textbox") as HTMLInputElement).value.trim() === "",
    );
    expect(emptyWords).toEqual([]);
  });

  it('AC-2: po zmianie słowa dla "14" na "tur" generowanie dla zagadnienia "14" zwraca "tur"', async () => {
    const user = userEvent.setup();
    render(<PegWordsScreen />);
    const row = await findRow("14");

    const input = within(row).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "tur");
    await user.click(within(row).getByRole("button", { name: "Zapisz" }));

    await waitFor(() => expect(within(row).getByText("własne")).toBeInTheDocument());
    const generated = await apiJson<GeneratedWordImagesDto>("/api/word-images/generate", "POST", {
      topic: "14",
    });
    expect(generated.imageWords).toBe("tur");
  });

  it("AC-3: zapis pustego słowa dla hasła jest odrzucony i hasło zachowuje poprzednie słowo", async () => {
    const user = userEvent.setup();
    const first = render(<PegWordsScreen />);
    const row = await findRow("14");

    await user.clear(within(row).getByRole("textbox"));
    await user.click(within(row).getByRole("button", { name: "Zapisz" }));

    expect(await within(row).findByText("Podaj słowo")).toBeInTheDocument();
    expect((await prisma.pegWord.findUniqueOrThrow({ where: { number: "14" } })).word).toBe(
      DEFAULT_PEG_WORDS["14"],
    );
    first.unmount();
    render(<PegWordsScreen />);
    expect(within(await findRow("14")).getByRole("textbox")).toHaveValue(DEFAULT_PEG_WORDS["14"]);
  });

  it('AC-4: akcja "Przywróć domyślne" dla hasła ze zmienionym słowem przywraca słowo startowe', async () => {
    const user = userEvent.setup();
    await prisma.pegWord.update({ where: { number: "14" }, data: { word: "tur" } });
    render(<PegWordsScreen />);
    const row = await findRow("14");
    expect(within(row).getByRole("textbox")).toHaveValue("tur");

    await user.click(within(row).getByRole("button", { name: "Przywróć domyślne" }));

    await waitFor(() =>
      expect(within(row).getByRole("textbox")).toHaveValue(DEFAULT_PEG_WORDS["14"]),
    );
    expect(within(row).queryByText("własne")).not.toBeInTheDocument();
    expect((await prisma.pegWord.findUniqueOrThrow({ where: { number: "14" } })).word).toBe(
      DEFAULT_PEG_WORDS["14"],
    );
  });

  it("API listy GSP: kolejność, walidacja słowa i nieistniejące hasło", async () => {
    const list = await apiJson<{ number: string; isCustom: boolean }[]>("/api/peg-words");
    expect(list).toHaveLength(110);
    expect(list[9].number).toBe("9");
    expect(list[10].number).toBe("00");
    expect(list.some((peg) => peg.isCustom)).toBe(false);

    const put = (number: string, word: string) =>
      apiFetch(`/api/peg-words/${number}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ word }),
      });
    expect((await put("14", "  ")).status).toBe(400);
    expect((await put("14", "a".repeat(41))).status).toBe(400);
    expect((await put("123", "tur")).status).toBe(404);
    expect((await put("ab", "tur")).status).toBe(404);
    const updated = await put("14", " tur ");
    expect(updated.status).toBe(200);
    expect(await updated.json()).toMatchObject({
      number: "14",
      word: "tur",
      defaultWord: DEFAULT_PEG_WORDS["14"],
      isCustom: true,
    });
    expect((await apiFetch("/api/peg-words/123/reset", { method: "POST" })).status).toBe(404);
  });
});
