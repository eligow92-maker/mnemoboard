import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testy nigdy nie dotykają bazy deweloperskiej: klient z src/lib/db.ts dostaje adres bazy testowej.
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST ?? "";

// Vitest działa bez globalnych funkcji, więc Testing Library nie sprząta DOM samo.
afterEach(() => {
  cleanup();
});
