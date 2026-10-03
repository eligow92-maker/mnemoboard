import { Prisma, PrismaClient } from "@prisma/client";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { BoardDetailDto } from "@/lib/api-types";
import { prisma } from "@/lib/db";
import { apiFetch } from "../helpers/api-fetch";
import { resetDb } from "../helpers/db";

// W tym pliku aplikacja dostaje klienta Prisma, który zgłasza każde zapytanie SQL —
// dzięki temu test liczy zapytania faktycznie wykonane przez handler trasy.
vi.mock("@/lib/db", () => ({
  prisma: new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL_TEST,
    log: [{ emit: "event", level: "query" }],
  }),
}));

type QueryLoggingClient = PrismaClient<{ log: [{ emit: "event"; level: "query" }] }>;

const NOTE_COUNT = 200;
const ZONE_COUNT = 20;
const CONNECTION_COUNT = 200;
const LIMIT_MS = 500;

describe("TASK-023 Wydajność dużej planszy", () => {
  let boardId: string;

  // Plansza: 20 stref w siatce, 200 karteczek, łańcuch 150 karteczek (149 ogniw) i 51 linii mapy myśli.
  beforeAll(async () => {
    await resetDb();
    boardId = (await prisma.board.create({ data: { name: "Duża plansza" } })).id;
    await prisma.zone.createMany({
      data: Array.from({ length: ZONE_COUNT }, (_, index) => ({
        boardId,
        name: `Pokój ${index + 1}`,
        x: (index % 5) * 1000,
        y: Math.floor(index / 5) * 800,
        width: 900,
        height: 700,
      })),
    });
    const zones = await prisma.zone.findMany({ where: { boardId }, orderBy: { x: "asc" } });
    await prisma.note.createMany({
      data: Array.from({ length: NOTE_COUNT }, (_, index) => ({
        boardId,
        zoneId: zones[index % ZONE_COUNT].id,
        topic: `Zagadnienie ${index + 1} – ${"opis ".repeat(10)}`,
        imageWords: "tor, tuz, mama, kot",
        x: (index % 20) * 220,
        y: Math.floor(index / 20) * 140,
        createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)),
      })),
    });
    const notes = await prisma.note.findMany({ where: { boardId }, orderBy: { createdAt: "asc" } });
    const chain = Array.from({ length: 149 }, (_, index) => ({
      boardId,
      sourceNoteId: notes[index].id,
      targetNoteId: notes[index + 1].id,
      kind: "chain" as const,
    }));
    const associations = Array.from({ length: CONNECTION_COUNT - chain.length }, (_, index) => ({
      boardId,
      sourceNoteId: notes[150 + (index % 50)].id,
      targetNoteId: notes[(index * 7) % 100].id,
      kind: "association" as const,
    }));
    await prisma.connection.createMany({ data: [...chain, ...associations] });
  });

  it("AC-1: GET /api/boards/{id} dla planszy z 200 karteczkami, 20 strefami i 200 połączeniami odpowiada w czasie krótszym niż 500 ms", async () => {
    // Pierwsze żądanie rozgrzewa połączenie z bazą i import modułu trasy.
    await apiFetch(`/api/boards/${boardId}`);

    const durations: number[] = [];
    let board: BoardDetailDto | undefined;
    for (let attempt = 0; attempt < 5; attempt++) {
      const startedAt = performance.now();
      const response = await apiFetch(`/api/boards/${boardId}`);
      board = (await response.json()) as BoardDetailDto;
      durations.push(performance.now() - startedAt);
      expect(response.status).toBe(200);
    }

    expect(board?.notes).toHaveLength(NOTE_COUNT);
    expect(board?.zones).toHaveLength(ZONE_COUNT);
    expect(board?.connections).toHaveLength(CONNECTION_COUNT);
    expect(board?.notes[149].chainPosition).toBe(150);
    expect(Math.max(...durations)).toBeLessThan(LIMIT_MS);
  });

  it("GET /api/boards/{id} wykonuje tyle samo zapytań dla dużej i dla pustej planszy (brak N+1)", async () => {
    const emptyBoard = await prisma.board.create({ data: { name: "Pusta plansza" } });
    const queries: string[] = [];
    (prisma as unknown as QueryLoggingClient).$on("query", (event: Prisma.QueryEvent) => {
      queries.push(event.query);
    });
    const countQueries = async (id: string): Promise<number> => {
      queries.length = 0;
      expect((await apiFetch(`/api/boards/${id}`)).status).toBe(200);
      return queries.filter((query) => query.trimStart().startsWith("SELECT")).length;
    };

    const forEmpty = await countQueries(emptyBoard.id);
    const forLarge = await countQueries(boardId);

    expect(forLarge).toBeGreaterThan(0);
    // Pusta plansza może pominąć zapytania o relacje; duża nie może potrzebować więcej niż
    // jedno zapytanie na tabelę (plansza, karteczki, strefy, połączenia).
    expect(forLarge).toBeLessThanOrEqual(4);
    expect(forLarge).toBeGreaterThanOrEqual(forEmpty);
  });
});
