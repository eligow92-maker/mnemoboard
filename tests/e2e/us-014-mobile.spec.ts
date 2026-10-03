import { expect, test, type Page } from "@playwright/test";
import { createBoard, createNote, deleteBoard, noteNode, notePosition } from "./helpers";

const PHONE_WIDTH = 375;

// Strona nie przewija się w poziomie, a każdy element treści mieści się w szerokości telefonu.
// Porównujemy ze stałą szerokością: w emulacji mobilnej `window.innerWidth` rośnie razem
// z za szeroką treścią, więc nie nadaje się na punkt odniesienia.
async function expectFitsViewport(page: Page): Promise<void> {
  const overflow = await page.evaluate((width) => {
    const offenders = Array.from(document.querySelectorAll("main *"))
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .filter(
        ({ element, rect }) =>
          // Pomijamy elementy ukryte wizualnie (sr-only), planszę i teksty celowo ucinane wielokropkiem.
          rect.width > 1 &&
          !element.closest(".react-flow") &&
          getComputedStyle(element).textOverflow !== "ellipsis" &&
          (rect.left < -0.5 ||
            rect.right > width + 0.5 ||
            element.scrollWidth > element.clientWidth + 1),
      )
      .map(
        ({ element }) =>
          `${element.tagName.toLowerCase()}: ${element.textContent?.trim().slice(0, 40) ?? ""}`,
      );
    return { scrollWidth: document.documentElement.scrollWidth, offenders };
  }, PHONE_WIDTH);
  expect(overflow.offenders).toEqual([]);
  expect(overflow.scrollWidth).toBeLessThanOrEqual(PHONE_WIDTH);
}

// Przeciągnięcie jednym palcem (zdarzenia dotyku wysyłane przez protokół przeglądarki).
async function touchDrag(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
): Promise<void> {
  const client = await page.context().newCDPSession(page);
  const send = (type: "touchStart" | "touchMove" | "touchEnd", point?: { x: number; y: number }) =>
    client.send("Input.dispatchTouchEvent", { type, touchPoints: point ? [point] : [] });
  const steps = 10;
  await send("touchStart", from);
  for (let step = 1; step <= steps; step++) {
    await send("touchMove", {
      x: from.x + ((to.x - from.x) * step) / steps,
      y: from.y + ((to.y - from.y) * step) / steps,
    });
  }
  await send("touchEnd");
  await client.detach();
}

test.describe("TASK-021 US-014 Praca na telefonie", () => {
  let boardId: string;

  test.beforeEach(async ({ request }) => {
    boardId = await createBoard(request, "US-014");
  });

  test.afterEach(async ({ request }) => {
    await deleteBoard(request, boardId);
  });

  test("AC-1: na ekranie o szerokości 375 px wszystkie elementy powtórki mieszczą się bez przewijania w poziomie", async ({
    page,
    request,
  }) => {
    expect(page.viewportSize()?.width).toBe(PHONE_WIDTH);
    await request.post(`/api/boards/${boardId}/zones`, {
      data: {
        name: "Bardzo długa nazwa pokoju w pałacu pamięci numer jeden",
        x: 0,
        y: 0,
        width: 400,
        height: 400,
      },
    });
    await createNote(request, boardId, {
      topic:
        "Konstantynopolitańczykowianeczka1410bitwapodGrunwaldemzwycięstwo – bitwa pod Grunwaldem",
      imageWords: "tor, tuz, konstantynopolitańczykowianeczkakonstantynopolitańczykowianeczka",
      x: 20,
      y: 20,
    });
    await createNote(request, boardId, { topic: "966", imageWords: "boja, jeż", x: 600, y: 600 });

    await page.goto(`/boards/${boardId}/review`);
    await expect(page.getByText("Karta 1 z 2")).toBeVisible();
    await expectFitsViewport(page);

    await page.getByRole("button", { name: "Odsłoń" }).tap();
    await expect(page.getByRole("button", { name: "Nie pamiętałem" })).toBeVisible();
    await expect(page.getByLabel(/^Pokój:/)).toBeVisible();
    await expectFitsViewport(page);

    await page.getByRole("button", { name: "Pamiętałem", exact: true }).tap();
    await expect(page.getByText("Karta 2 z 2")).toBeVisible();
    await page.getByRole("button", { name: "Odsłoń" }).tap();
    await page.getByRole("button", { name: "Nie pamiętałem" }).tap();
    await expect(page.getByText("1 z 2", { exact: true })).toBeVisible();
    await expectFitsViewport(page);
  });

  test("AC-2: karteczka przeciągnięta palcem na urządzeniu dotykowym zmienia położenie", async ({
    page,
    request,
  }) => {
    const noteId = await createNote(request, boardId, { topic: "1410", x: 40, y: 40 });
    await page.goto(`/boards/${boardId}`);
    const node = noteNode(page, noteId);
    await expect(node).toBeVisible();
    const before = await notePosition(node);
    const box = await node.boundingBox();
    if (!box) throw new Error("Karteczka bez wymiarów");
    const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

    const saved = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/notes/${noteId}`) && response.request().method() === "PATCH",
    );
    await touchDrag(page, start, { x: start.x + 90, y: start.y + 150 });

    expect((await saved).status()).toBe(200);
    const after = await notePosition(node);
    expect(after.x - before.x).toBeGreaterThan(60);
    expect(after.y - before.y).toBeGreaterThan(110);
    await page.reload();
    await expect(noteNode(page, noteId)).toBeVisible();
    expect(await notePosition(noteNode(page, noteId))).toEqual(after);
  });

  test("AC-3: karteczka dodana na jednym urządzeniu jest widoczna po otwarciu planszy na drugim urządzeniu", async ({
    page,
    browser,
    baseURL,
  }) => {
    // Pierwsze urządzenie: komputer.
    const computer = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 } });
    const computerPage = await computer.newPage();
    await computerPage.goto(`/boards/${boardId}`);
    await computerPage.getByRole("button", { name: "Dodaj karteczkę" }).click();
    await computerPage.locator(".react-flow__pane").click({ position: { x: 200, y: 200 } });
    await computerPage.getByLabel("Zagadnienie").fill("Dodane na komputerze");
    await computerPage.getByRole("button", { name: "Zapisz" }).click();
    await expect(computerPage.getByText("Dodane na komputerze")).toBeVisible();
    await computer.close();

    // Drugie urządzenie: telefon.
    await page.goto(`/boards/${boardId}`);

    await expect(page.getByText("Dodane na komputerze")).toBeVisible();
  });

  test("lista plansz, lista GSP i edytor planszy mieszczą się na 375 px", async ({ page }) => {
    for (const path of ["/", "/peg-words", `/boards/${boardId}`]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.waitForLoadState("networkidle");
      await expectFitsViewport(page);
    }
  });

  test("elementy dotykowe edytora planszy mają co najmniej 44 px", async ({ page, request }) => {
    await createNote(request, boardId, { topic: "1410", x: 40, y: 40 });
    await page.goto(`/boards/${boardId}`);
    await expect(page.getByRole("button", { name: "Dodaj karteczkę" })).toBeVisible();

    const tooSmall = await page.evaluate(() =>
      Array.from(document.querySelectorAll("button, a"))
        .map((element) => ({ element, rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width > 0 && (rect.height < 44 || rect.width < 44))
        .map(
          ({ element }) =>
            element.textContent?.trim() || element.getAttribute("aria-label") || element.className,
        ),
    );
    expect(tooSmall).toEqual([]);
  });
});
