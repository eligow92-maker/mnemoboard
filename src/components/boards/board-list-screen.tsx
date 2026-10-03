"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api-client";
import type { BoardDto, BoardSummaryDto, StatsDto } from "@/lib/api-types";
import { BoardCard } from "./board-card";
import { BoardForm } from "./board-form";

export function BoardListScreen() {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardSummaryDto[] | null>(null);
  const [stats, setStats] = useState<StatsDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;
    api<BoardSummaryDto[]>("/api/boards")
      .then((loaded) => active && setBoards(loaded))
      .catch((error: unknown) => active && setLoadError(errorMessage(error)));
    // Statystyki są dodatkiem — ich brak nie blokuje listy plansz.
    api<StatsDto>("/api/stats")
      .then((loaded) => active && setStats(loaded))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function createBoard(name: string): Promise<void> {
    const board = await api<BoardDto>("/api/boards", "POST", { name });
    setBoards((current) => [{ ...board, noteCount: 0, lastReview: null }, ...(current ?? [])]);
    setCreating(false);
    router.push(`/boards/${board.id}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Plansze</h1>
        {boards !== null && boards.length > 0 && !creating && (
          <Button onClick={() => setCreating(true)}>Nowa plansza</Button>
        )}
      </div>

      {stats && (
        <p
          aria-label="Statystyki"
          className="rounded-lg border border-border bg-surface px-4 py-3 font-medium"
        >
          {`Powtórki w ostatnich 7 dniach: ${stats.sessionsLast7Days}`}
        </p>
      )}

      {loadError && (
        <p role="alert" className="text-error">
          {loadError}
        </p>
      )}
      {boards === null && !loadError && <p className="text-text-secondary">Wczytywanie…</p>}

      {creating && (
        <section
          aria-label="Nowa plansza"
          className="rounded-lg border border-border bg-surface p-4"
        >
          <BoardForm
            submitLabel="Utwórz"
            onSubmit={createBoard}
            onCancel={() => setCreating(false)}
          />
        </section>
      )}

      {boards !== null && boards.length === 0 && !creating && (
        <section className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-lg font-medium">Nie masz jeszcze żadnej planszy</p>
          <p className="text-text-secondary">
            Plansza to miejsce na karteczki z jednego tematu, np. „Historia Polski”.
          </p>
          <Button onClick={() => setCreating(true)}>Utwórz pierwszą planszę</Button>
        </section>
      )}

      {boards !== null && boards.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </ul>
      )}
    </main>
  );
}
