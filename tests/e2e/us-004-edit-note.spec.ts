import { expect, test } from "@playwright/test";
import { createBoard, createNote, deleteBoard, noteNode, notePosition } from "./helpers";

test.describe("TASK-007 US-004 Przesuwanie, edycja i usuwanie karteczki", () => {
  let boardId: string;

  test.beforeEach(async ({ request }) => {
    boardId = await createBoard(request, "US-004");
  });

  test.afterEach(async ({ request }) => {
    await deleteBoard(request, boardId);
  });

  test("AC-1: karteczka przeciągnięta w inne miejsce po odświeżeniu strony znajduje się w nowym miejscu", async ({
    page,
    request,
  }) => {
    const noteId = await createNote(request, boardId, { topic: "1410", x: 60, y: 60 });
    await page.goto(`/boards/${boardId}`);
    const node = noteNode(page, noteId);
    await expect(node).toBeVisible();
    const box = await node.boundingBox();
    if (!box) throw new Error("Karteczka bez wymiarów");

    const saved = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/notes/${noteId}`) && response.request().method() === "PATCH",
    );
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 40, { steps: 8 });
    await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 80, { steps: 8 });
    await page.mouse.up();
    expect((await saved).status()).toBe(200);
    const moved = await notePosition(node);
    expect(moved.x).toBeGreaterThan(150);
    expect(moved.y).toBeGreaterThan(110);

    await page.reload();

    await expect(noteNode(page, noteId)).toBeVisible();
    expect(await notePosition(noteNode(page, noteId))).toEqual(moved);
  });
});
