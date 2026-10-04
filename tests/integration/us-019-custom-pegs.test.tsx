import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PegWordsScreen } from "@/components/peg-words/peg-words-screen";
import type { PegWordDto } from "@/lib/api-types";
import { prisma } from "@/lib/db";
import { seedPegWords } from "@/modules/word-images/seed";
import { apiFetch, apiJson, installApiFetch } from "../helpers/api-fetch";

const customEntry = (number: string, word: string) =>
  prisma.pegWord.create({ data: { number, word } });

async function customSection(): Promise<HTMLElement> {
  return screen.findByRole("region", { name: "Własne wpisy" });
}

async function addEntry(
  user: ReturnType<typeof userEvent.setup>,
  number: string,
  word: string,
): Promise<void> {
  await user.type(await screen.findByLabelText("Liczba (3–15 cyfr)"), number);
  await user.type(screen.getByLabelText("Słowo lub fraza"), word);
  await user.click(screen.getByRole("button", { name: "Dodaj wpis" }));
}

describe("TASK-030 US-019 Zarządzanie własnymi wpisami GSP", () => {
  beforeEach(async () => {
    await prisma.pegWord.deleteMany();
    await seedPegWords(prisma);
    installApiFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('AC-1: dodany własny wpis "333" ze słowem "mumia-mysz" jest widoczny na liście własnych wpisów jako "333 – mumia-mysz"', async () => {
    const user = userEvent.setup();
    render(<PegWordsScreen />);

    await addEntry(user, "333", "mumia-mysz");

    const section = await customSection();
    expect(await within(section).findByText("333 – mumia-mysz")).toBeInTheDocument();
    expect(await prisma.pegWord.findUnique({ where: { number: "333" } })).toMatchObject({
      word: "mumia-mysz",
      defaultWord: null,
    });
  });

  it('AC-2: drugi wpis dla liczby "333" nie powstaje i pokazuje komunikat "Wpis dla tej liczby już istnieje"', async () => {
    const user = userEvent.setup();
    await customEntry("333", "mumia-mysz");
    render(<PegWordsScreen />);

    await addEntry(user, "333", "mamut");

    expect(await screen.findByText("Wpis dla tej liczby już istnieje")).toBeInTheDocument();
    expect(await prisma.pegWord.count({ where: { number: "333" } })).toBe(1);
    expect((await prisma.pegWord.findUniqueOrThrow({ where: { number: "333" } })).word).toBe(
      "mumia-mysz",
    );
  });

  it('AC-3: wpis dla liczby "33" nie powstaje i pokazuje komunikat "Własny wpis musi mieć od 3 do 15 cyfr"', async () => {
    const user = userEvent.setup();
    render(<PegWordsScreen />);

    await addEntry(user, "33", "mama");

    expect(await screen.findByText("Własny wpis musi mieć od 3 do 15 cyfr")).toBeInTheDocument();
    // Hasło wbudowane "33" istnieje od początku; liczy się brak nowego własnego wpisu.
    expect(await prisma.pegWord.count({ where: { defaultWord: null } })).toBe(0);
    expect(
      (await prisma.pegWord.findUniqueOrThrow({ where: { number: "33" } })).defaultWord,
    ).not.toBeNull();
  });

  it('AC-4: po zmianie słowa własnego wpisu "333" na "mamut" wpis pokazuje "333 – mamut"', async () => {
    const user = userEvent.setup();
    await customEntry("333", "mumia-mysz");
    render(<PegWordsScreen />);

    const section = await customSection();
    await user.click(await within(section).findByRole("button", { name: "Zmień wpis 333" }));
    const input = within(section).getByLabelText("Słowo dla 333");
    await user.clear(input);
    await user.type(input, "mamut");
    await user.click(within(section).getByRole("button", { name: "Zapisz" }));

    expect(await within(section).findByText("333 – mamut")).toBeInTheDocument();
    expect(within(section).queryByText("333 – mumia-mysz")).not.toBeInTheDocument();
    expect((await prisma.pegWord.findUniqueOrThrow({ where: { number: "333" } })).word).toBe(
      "mamut",
    );
  });

  it('AC-5: usunięty własny wpis "333" znika z listy własnych wpisów', async () => {
    const user = userEvent.setup();
    await customEntry("333", "mumia-mysz");
    render(<PegWordsScreen />);

    const section = await customSection();
    await user.click(await within(section).findByRole("button", { name: "Usuń wpis 333" }));

    await waitFor(() =>
      expect(within(section).queryByText("333 – mumia-mysz")).not.toBeInTheDocument(),
    );
    expect(await prisma.pegWord.findUnique({ where: { number: "333" } })).toBeNull();
  });

  it("własne wpisy nie trafiają do tabeli 110 haseł wbudowanych", async () => {
    await customEntry("333", "mumia-mysz");
    render(<PegWordsScreen />);

    await screen.findByRole("row", { name: "Hasło 14" });

    const rows = screen.getAllByRole("row").filter((row) => row.hasAttribute("data-peg-number"));
    expect(rows).toHaveLength(110);
  });

  it("API: lista oznacza rodzaj hasła, a własne wpisy są za wbudowanymi posortowane według długości", async () => {
    await customEntry("3334", "x");
    await customEntry("333", "y");

    const list = await apiJson<PegWordDto[]>("/api/peg-words");

    expect(list).toHaveLength(112);
    expect(list.slice(-2).map((item) => [item.number, item.kind])).toEqual([
      ["333", "custom"],
      ["3334", "custom"],
    ]);
    expect(list[0]).toMatchObject({ number: "0", kind: "builtin" });
  });

  it("API: usunięcie hasła wbudowanego → 409 PEG_BUILTIN, reset własnego wpisu → 409 PEG_NO_DEFAULT", async () => {
    await customEntry("333", "mumia-mysz");

    const del = await apiFetch("/api/peg-words/14", { method: "DELETE" });
    const reset = await apiFetch("/api/peg-words/333/reset", { method: "POST" });

    expect(del.status).toBe(409);
    expect(await del.json()).toMatchObject({ code: "PEG_BUILTIN" });
    expect(reset.status).toBe(409);
    expect(await reset.json()).toMatchObject({ code: "PEG_NO_DEFAULT" });
  });

  it("API: słowo hasła wbudowanego ma do 40 znaków, własnego wpisu do 80", async () => {
    await customEntry("333", "mumia-mysz");
    const put = (number: string, word: string) =>
      apiFetch(`/api/peg-words/${number}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ word }),
      });

    expect((await put("14", "a".repeat(41))).status).toBe(400);
    expect((await put("333", "a".repeat(80))).status).toBe(200);
    expect((await put("333", "a".repeat(81))).status).toBe(400);
  });

  it("API: liczba spoza 3–15 cyfr lub z literami jest odrzucana, a po 500 wpisach dodanie daje 409 PEG_LIMIT", async () => {
    const post = (number: string) =>
      apiFetch("/api/peg-words", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ number, word: "słowo" }),
      });
    await prisma.pegWord.createMany({
      data: Array.from({ length: 500 }, (_, index) => ({
        number: String(100000 + index),
        word: "w",
      })),
    });

    expect((await post("1234567890123456")).status).toBe(400);
    expect((await post("12a")).status).toBe(400);
    const limit = await post("777");
    expect(limit.status).toBe(409);
    expect(await limit.json()).toMatchObject({ code: "PEG_LIMIT" });
  });
});
