import { expect, test } from "@playwright/test";

// Sprawdzenie nagłówków w prawdziwych odpowiedziach serwera (konfigurację sprawdza test TASK-022 AC-1).
test.describe("TASK-022 Utwardzenie bezpieczeństwa", () => {
  for (const path of ["/", "/peg-words", "/api/health", "/api/boards", "/nie-ma-takiej-strony"]) {
    test(`odpowiedź ${path} ma nagłówki bezpieczeństwa`, async ({ request }) => {
      const response = await request.get(path);
      const headers = response.headers();

      expect(headers["content-security-policy"]).toContain("default-src 'self'");
      expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["referrer-policy"]).toBe("no-referrer");
      expect(headers["x-powered-by"]).toBeUndefined();
    });
  }

  test("strony działają pod polityką CSP bez naruszeń", async ({ page, request }) => {
    const violations: string[] = [];
    page.on("console", (message) => {
      if (/Content Security Policy|Refused to/i.test(message.text()))
        violations.push(message.text());
    });
    const created = await request.post("/api/boards", { data: { name: "E2E CSP" } });
    const board = await created.json();
    await request.post(`/api/boards/${board.id}/notes`, {
      data: { topic: "1410", imageWords: "tor, tuz", x: 60, y: 60 },
    });

    try {
      await page.goto("/");
      await expect(page.getByRole("link", { name: /E2E CSP/ })).toBeVisible();
      await page.goto(`/boards/${board.id}`);
      await expect(page.getByText("1410")).toBeVisible();
      await page.goto(`/boards/${board.id}/review`);
      await expect(page.getByRole("button", { name: "Odsłoń" })).toBeVisible();
      await page.goto("/peg-words");
      await expect(page.getByRole("row", { name: "Hasło 14", exact: true })).toBeVisible();
    } finally {
      await request.delete(`/api/boards/${board.id}`);
    }

    expect(violations).toEqual([]);
  });
});
