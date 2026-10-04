"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { api, ApiClientError, errorMessage } from "@/lib/api-client";
import type { PegWordDto } from "@/lib/api-types";
import { PEG_WORD_MAX_LENGTH, PEG_WORD_REQUIRED_MESSAGE } from "@/modules/word-images/schema";

interface PegWordRowProps {
  pegWord: PegWordDto;
  onChange: (pegWord: PegWordDto) => void;
}

// Wiersz listy GSP z edycją w miejscu.
export function PegWordRow({ pegWord, onChange }: PegWordRowProps) {
  const [word, setWord] = useState(pegWord.word);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dirty = word !== pegWord.word;

  async function run(request: () => Promise<PegWordDto>): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      const updated = await request();
      setWord(updated.word);
      onChange(updated);
    } catch (caught) {
      const fieldError = caught instanceof ApiClientError ? caught.fields.word : undefined;
      setError(fieldError ?? errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const trimmed = word.trim();
    if (trimmed === "") {
      setError(PEG_WORD_REQUIRED_MESSAGE);
      return;
    }
    await run(() => api<PegWordDto>(`/api/peg-words/${pegWord.number}`, "PUT", { word: trimmed }));
  }

  return (
    <tr
      aria-label={`Hasło ${pegWord.number}`}
      data-peg-number={pegWord.number}
      className="border-b border-border align-top"
    >
      <th scope="row" className="w-12 py-3 pr-2 text-left text-lg font-bold tabular-nums">
        {pegWord.number}
      </th>
      <td className="py-2">
        <form onSubmit={handleSubmit} noValidate className="flex flex-wrap items-center gap-2">
          <input
            aria-label={`Słowo dla ${pegWord.number}`}
            aria-invalid={error ? true : undefined}
            value={word}
            maxLength={PEG_WORD_MAX_LENGTH}
            onChange={(event) => {
              setWord(event.target.value);
              setError(null);
            }}
            className="min-h-11 min-w-0 flex-1 basis-36 rounded-md border border-border bg-surface px-3 py-2"
          />
          {pegWord.isCustom && !dirty && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-white">
              własne
            </span>
          )}
          {dirty && (
            <>
              <Button type="submit" disabled={saving}>
                Zapisz
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setWord(pegWord.word);
                  setError(null);
                }}
              >
                Anuluj
              </Button>
            </>
          )}
          {pegWord.isCustom && !dirty && (
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() =>
                run(() => api<PegWordDto>(`/api/peg-words/${pegWord.number}/reset`, "POST"))
              }
            >
              Przywróć domyślne
            </Button>
          )}
        </form>
        <FieldError message={error} />
      </td>
    </tr>
  );
}
