import "@testing-library/jest-dom/vitest";

// Testy nigdy nie dotykają bazy deweloperskiej: klient z src/lib/db.ts dostaje adres bazy testowej.
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST ?? "";
