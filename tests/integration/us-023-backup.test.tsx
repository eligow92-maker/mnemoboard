import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardListScreen } from "@/components/boards/board-list-screen";
import { prisma } from "@/lib/db";
import { seedPegWords } from "@/modules/word-images/seed";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { resetDb } from "../helpers/db";

const asFile = (content: string, name = "kopia.json") =>
  new File([content], name, { type: "application/json" });

// Dwie plansze z karteczkami i ukończonymi powtórkami, zmienione słowo "14" i własny wpis "333".
async function createBackupData(): Promise<void> {
  for (const [name, remembered] of [
    ["Historia Polski", 4],
    ["Biologia", 2],
  ] as const) {
    const board = await prisma.board.create({ data: { name } });
    const notes = [];
    for (let i = 0; i < 5; i++) {
      notes.push(
        await prisma.note.create({
          data: { boardId: board.id, topic: `${name} ${i}`, imageWords: "słowa", x: i, y: 0 },
        }),
      );
    }
    const session = await prisma.reviewSession.create({
      data: { boardId: board.id, finishedAt: new Date() },
    });
    await prisma.reviewResult.createMany({
      data: notes.map((note, index) => ({
        sessionId: session.id,
        noteId: note.id,
        remembered: index < remembered,
      })),
    });
  }
  await prisma.pegWord.update({ where: { number: "14" }, data: { word: "tur" } });
  await prisma.pegWord.create({ data: { number: "333", word: "mumia-mysz" } });
}

async function resetAll(): Promise<void> {
  await resetDb();
  await prisma.pegWord.deleteMany();
  await seedPegWords(prisma);
}

const downloadBackupText = async (): Promise<string> => (await apiFetch("/api/backup")).text();

async function restoreVia(
  user: ReturnType<typeof userEvent.setup>,
  content: string,
): Promise<void> {
  await user.upload(await screen.findByLabelText("Przywróć z kopii"), asFile(content));
}

describe("TASK-036 US-023 Pełna kopia zapasowa", () => {
  beforeEach(async () => {
    await resetAll();
    installApiFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('AC-1: "Pobierz kopię" przy 2 planszach, zmienionym słowie "14" i własnym wpisie "333" pobiera plik z 2 planszami z historią powtórek, słowem dla "14" i wpisem "333"', async () => {
    const user = userEvent.setup();
    await createBackupData();
    const blobs: Blob[] = [];
    vi.stubGlobal(
      "URL",
      Object.assign(URL, {
        createObjectURL: (blob: Blob) => {
          blobs.push(blob);
          return "blob:test";
        },
        revokeObjectURL: () => undefined,
      }),
    );
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      names.push(this.download);
    });
    render(<BoardListScreen />);

    await user.click(await screen.findByRole("button", { name: "Pobierz kopię" }));

    await waitFor(() => expect(names).toHaveLength(1));
    expect(names[0]).toMatch(/^mnemoboard-kopia-\d{4}-\d{2}-\d{2}\.json$/);
    const file = JSON.parse(await blobs[0].text());
    expect(file.kind).toBe("backup");
    expect(file.boards).toHaveLength(2);
    for (const board of file.boards) {
      expect(board.reviewSessions).toHaveLength(1);
      expect(board.reviewSessions[0].results).toHaveLength(5);
    }
    expect(file.pegWords).toEqual(
      expect.arrayContaining([
        { number: "14", word: "tur" },
        { number: "333", word: "mumia-mysz" },
      ]),
    );
  });

  it('AC-2: przywrócenie kopii z 2 planszami, zmienionym słowem "14" i wpisem "333" na świeżej instalacji daje 2 plansze z wynikami ostatnich powtórek, słowo "14" i wpis "333"', async () => {
    const user = userEvent.setup();
    await createBackupData();
    const backupText = await downloadBackupText();
    await resetAll();
    render(<BoardListScreen />);

    await restoreVia(user, backupText);
    await user.click(await screen.findByRole("button", { name: "Przywróć" }));

    expect(await screen.findByRole("link", { name: /Historia Polski/ })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /Biologia/ })).toBeInTheDocument();
    expect(await screen.findByText(/80%/)).toBeInTheDocument();
    expect(await screen.findByText(/40%/)).toBeInTheDocument();
    expect(await prisma.board.count()).toBe(2);
    expect((await prisma.pegWord.findUniqueOrThrow({ where: { number: "14" } })).word).toBe("tur");
    expect((await prisma.pegWord.findUniqueOrThrow({ where: { number: "333" } })).word).toBe(
      "mumia-mysz",
    );
  });

  it('AC-3: przywrócenie kopii z 2 planszami przy istniejącej planszy "Biologia" nie zmienia jej, a lista ma 3 plansze', async () => {
    const user = userEvent.setup();
    await createBackupData();
    const backupText = await downloadBackupText();
    await resetAll();
    const existing = await prisma.board.create({ data: { name: "Biologia" } });
    await prisma.note.create({ data: { boardId: existing.id, topic: "Stara", x: 0, y: 0 } });
    render(<BoardListScreen />);

    await restoreVia(user, backupText);
    await user.click(await screen.findByRole("button", { name: "Przywróć" }));

    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(3));
    expect(await prisma.board.count()).toBe(3);
    const untouched = await prisma.board.findUniqueOrThrow({
      where: { id: existing.id },
      include: { notes: true },
    });
    expect(untouched.name).toBe("Biologia");
    expect(untouched.notes.map((note) => note.topic)).toEqual(["Stara"]);
  });

  it('AC-4: wybranie "Przywróć z kopii" dla pliku z 2 planszami pokazuje "Zostaną dodane 2 plansze", a dane zmieniają się dopiero po potwierdzeniu', async () => {
    const user = userEvent.setup();
    await createBackupData();
    const backupText = await downloadBackupText();
    await resetAll();
    render(<BoardListScreen />);

    await restoreVia(user, backupText);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Zostaną dodane 2 plansze")).toBeInTheDocument();
    expect(await prisma.board.count()).toBe(0);
    expect((await prisma.pegWord.findUniqueOrThrow({ where: { number: "14" } })).word).not.toBe(
      "tur",
    );

    await user.click(within(dialog).getByRole("button", { name: "Przywróć" }));

    await waitFor(async () => expect(await prisma.board.count()).toBe(2));
  });

  it('AC-5: przywracanie uszkodzonego pliku kopii niczego nie zmienia i pokazuje komunikat "Plik nie jest poprawną kopią Mnemoboard"', async () => {
    const user = userEvent.setup();
    await prisma.pegWord.update({ where: { number: "14" }, data: { word: "tara" } });
    render(<BoardListScreen />);

    await restoreVia(user, '{"format":"mnemoboard","version":1,"kind":"backup","boards":[');

    expect(await screen.findByText("Plik nie jest poprawną kopią Mnemoboard")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await prisma.board.count()).toBe(0);
    expect((await prisma.pegWord.findUniqueOrThrow({ where: { number: "14" } })).word).toBe("tara");
  });

  it("anulowanie potwierdzenia nie zmienia danych", async () => {
    const user = userEvent.setup();
    await createBackupData();
    const backupText = await downloadBackupText();
    await resetAll();
    render(<BoardListScreen />);

    await restoreVia(user, backupText);
    await user.click(await screen.findByRole("button", { name: "Anuluj" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await prisma.board.count()).toBe(0);
  });

  it("pełna kopia wczytana jako import planszy dostaje wskazówkę, że należy użyć przywracania", async () => {
    const user = userEvent.setup();
    await prisma.board.create({ data: { name: "Jedna" } });
    const backupText = await downloadBackupText();
    render(<BoardListScreen />);

    await user.upload(await screen.findByLabelText("Importuj planszę"), asFile(backupText));

    expect(
      await screen.findByText(/To jest pełna kopia zapasowa.*Przywróć z kopii/),
    ).toBeInTheDocument();
    expect(await prisma.board.count()).toBe(1);
  });

  it("plik eksportu pojedynczej planszy nie jest przyjmowany jako kopia i dostaje wskazówkę o imporcie", async () => {
    const user = userEvent.setup();
    const board = await prisma.board.create({ data: { name: "Jedna" } });
    const exported = await (await apiFetch(`/api/boards/${board.id}/export`)).text();
    await prisma.board.delete({ where: { id: board.id } });
    render(<BoardListScreen />);

    await restoreVia(user, exported);

    expect(
      await screen.findByText(/To jest eksport jednej planszy.*Importuj planszę/),
    ).toBeInTheDocument();
    expect(await prisma.board.count()).toBe(0);
  });

  it("odmiana komunikatu zapowiedzi zależy od liczby plansz", async () => {
    const user = userEvent.setup();
    await prisma.board.create({ data: { name: "Jedna" } });
    const one = await downloadBackupText();
    await resetDb();
    render(<BoardListScreen />);

    await restoreVia(user, one);

    expect(await screen.findByText("Zostanie dodana 1 plansza")).toBeInTheDocument();
  });

  it("API: restore z dryRun=true zwraca zapowiedź bez zapisu, a zły lub zbyt duży plik daje 400 i 413", async () => {
    await createBackupData();
    const text = await downloadBackupText();
    await resetAll();
    const post = (query: string, body: string) =>
      apiFetch(`/api/backup/restore${query}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      });

    const dry = await post("?dryRun=true", text);
    expect(await dry.json()).toEqual({
      dryRun: true,
      boardsAdded: 2,
      pegWordsUpdated: 1,
      customPegWordsAdded: 1,
    });
    expect(await prisma.board.count()).toBe(0);

    const bad = await post("", "{}");
    expect(bad.status).toBe(400);
    expect(await bad.json()).toMatchObject({ code: "INVALID_BACKUP_FILE" });

    const big = await post("", JSON.stringify({ pad: "x".repeat(50 * 1024 * 1024 + 1) }));
    expect(big.status).toBe(413);
    expect(await big.json()).toMatchObject({ code: "FILE_TOO_LARGE" });
  });
});
