import { expect, test } from "@playwright/test";
import { createBoard, deleteBoard } from "./helpers";

const NOTE_COUNT = 200;

// Cel z constraints.md: plansza z 200 karteczkami otwiera się w < 2 s w sieci lokalnej.
test.describe("TASK-023 Wydajność dużej planszy", () => {
  let boardId: string;

  test.beforeEach(async ({ request }) => {
    boardId = await createBoard(request, "TASK-023");
    // Karteczki w siatce 20×10, znacznie szerszej i wyższej niż okno przeglądarki.
    for (let index = 0; index < NOTE_COUNT; index++) {
      const response = await request.post(`/api/boards/${boardId}/notes`, {
        data: {
          topic: `Karteczka ${index + 1}`,
          imageWords: "tor, tuz",
          x: (index % 20) * 220,
          y: Math.floor(index / 20) * 140,
        },
      });
      expect(response.status()).toBe(201);
    }
  });

  test.afterEach(async ({ request }) => {
    await deleteBoard(request, boardId);
  });

  test("plansza z 200 karteczkami otwiera się poniżej 2 s i renderuje tylko widoczne karteczki", async ({
    page,
  }) => {
    // Pierwsze wejście kompiluje stronę w trybie dev — nie jest mierzone.
    await page.goto(`/boards/${boardId}`);
    await expect(page.getByText("Karteczka 1", { exact: true })).toBeVisible();

    const startedAt = Date.now();
    await page.reload();
    await expect(page.getByText("Karteczka 1", { exact: true })).toBeVisible();
    const elapsed = Date.now() - startedAt;

    const rendered = await page.locator(".react-flow__node").count();
    expect(elapsed).toBeLessThan(2000);
    expect(rendered).toBeGreaterThan(0);
    expect(rendered).toBeLessThan(NOTE_COUNT);

    // Po oddaleniu widoku ("Fit View") widać wszystkie karteczki.
    await page.getByRole("button", { name: "Fit View" }).click();
    await expect(page.locator(".react-flow__node")).toHaveCount(NOTE_COUNT);
  });
});
