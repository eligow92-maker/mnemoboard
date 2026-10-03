import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Testy nigdy nie dotykają bazy deweloperskiej: klient z src/lib/db.ts dostaje adres bazy testowej.
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST ?? "";

// Vitest działa bez globalnych funkcji, więc Testing Library nie sprząta DOM samo.
afterEach(() => {
  cleanup();
});

vi.mock("next/navigation", async () => {
  const { routerMock } = await import("./helpers/navigation");
  return { useRouter: () => routerMock };
});
