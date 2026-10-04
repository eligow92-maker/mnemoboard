import { expect, test } from "@playwright/test";
import { createBoard, createNote, deleteBoard, noteNode } from "./helpers";

test.describe("TASK-026 US-016 Emotki na karteczce", () => {
  let boardId: string;

  test.beforeEach(async ({ request }) => {
    boardId = await createBoard(request, "US-016");
  });

  test.afterEach(async ({ request }) => {
    await deleteBoard(request, boardId);
  });

  test("AC-2: emotki karteczki na planszy przy powiększeniu 100% mają rozmiar czcionki co najmniej 24 px", async ({
    page,
    request,
  }) => {
    const noteId = await createNote(request, boardId, {
      topic: "1410",
      x: 60,
      y: 60,
      emoji: "🏰⚔️",
    });
    await page.goto(`/boards/${boardId}`);

    const emoji = noteNode(page, noteId).getByTestId("note-emoji");
    await expect(emoji).toBeVisible();

    const zoom = await page.evaluate(() => window.devicePixelRatio);
    expect(zoom).toBe(1);
    const fontSize = await emoji.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(24);
  });
});
