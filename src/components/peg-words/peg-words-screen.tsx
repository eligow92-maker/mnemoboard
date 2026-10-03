"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api-client";
import type { PegWordDto } from "@/lib/api-types";
import { PegWordRow } from "./peg-word-row";

export function PegWordsScreen() {
  const [pegWords, setPegWords] = useState<PegWordDto[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api<PegWordDto[]>("/api/peg-words")
      .then((loaded) => active && setPegWords(loaded))
      .catch((error: unknown) => active && setLoadError(errorMessage(error)));
    return () => {
      active = false;
    };
  }, []);

  function replacePegWord(updated: PegWordDto): void {
    setPegWords(
      (current) =>
        current?.map((pegWord) => (pegWord.number === updated.number ? updated : pegWord)) ?? null,
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Lista GSP</h1>
      <p className="text-text-secondary">
        Słowa podstawiane za liczby przez akcję „Generuj słowa”. Każde możesz zamienić na własne
        skojarzenie.
      </p>

      {loadError && (
        <p role="alert" className="text-error">
          {loadError}
        </p>
      )}
      {pegWords === null && !loadError && <p className="text-text-secondary">Wczytywanie…</p>}

      {pegWords !== null && (
        <table className="w-full border-collapse">
          <thead className="sr-only">
            <tr>
              <th scope="col">Liczba</th>
              <th scope="col">Słowo</th>
            </tr>
          </thead>
          <tbody>
            {pegWords.map((pegWord) => (
              <PegWordRow key={pegWord.number} pegWord={pegWord} onChange={replacePegWord} />
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
