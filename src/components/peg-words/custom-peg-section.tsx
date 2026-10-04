"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, TextField } from "@/components/ui/field";
import { api, ApiClientError, errorMessage } from "@/lib/api-client";
import type { PegWordDto } from "@/lib/api-types";
import {
  CUSTOM_PEG_WORD_MAX_LENGTH,
  PEG_WORD_REQUIRED_MESSAGE,
} from "@/modules/word-images/schema";

interface CustomPegSectionProps {
  entries: PegWordDto[];
  onAdded: (entry: PegWordDto) => void;
  onChanged: (entry: PegWordDto) => void;
  onRemoved: (number: string) => void;
}

function CustomPegForm({ onAdded }: { onAdded: (entry: PegWordDto) => void }) {
  const [number, setNumber] = useState("");
  const [word, setWord] = useState("");
  const [numberError, setNumberError] = useState<string | null>(null);
  const [wordError, setWordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setNumberError(null);
    setWordError(null);
    setFormError(null);
    try {
      onAdded(await api<PegWordDto>("/api/peg-words", "POST", { number, word }));
      setNumber("");
      setWord("");
    } catch (caught) {
      if (caught instanceof ApiClientError && caught.code === "PEG_EXISTS") {
        setNumberError(caught.message);
      } else if (caught instanceof ApiClientError && Object.keys(caught.fields).length > 0) {
        setNumberError(caught.fields.number ?? null);
        setWordError(caught.fields.word ?? null);
      } else {
        setFormError(errorMessage(caught));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <TextField
        id="custom-peg-number"
        label="Liczba (3–15 cyfr)"
        inputMode="numeric"
        value={number}
        onChange={(event) => setNumber(event.target.value)}
        error={numberError}
      />
      <TextField
        id="custom-peg-word"
        label="Słowo lub fraza"
        value={word}
        maxLength={CUSTOM_PEG_WORD_MAX_LENGTH}
        onChange={(event) => setWord(event.target.value)}
        error={wordError}
      />
      <FieldError message={formError} />
      <Button type="submit" disabled={saving} className="self-start">
        Dodaj wpis
      </Button>
    </form>
  );
}

function CustomPegRow({
  entry,
  onChanged,
  onRemoved,
}: {
  entry: PegWordDto;
  onChanged: (entry: PegWordDto) => void;
  onRemoved: (number: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [word, setWord] = useState(entry.word);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function run(request: () => Promise<void>): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await request();
    } catch (caught) {
      const fieldError = caught instanceof ApiClientError ? caught.fields.word : undefined;
      setError(fieldError ?? errorMessage(caught));
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
    await run(async () => {
      onChanged(await api<PegWordDto>(`/api/peg-words/${entry.number}`, "PUT", { word: trimmed }));
      setEditing(false);
      setSaving(false);
    });
  }

  return (
    <li className="flex flex-col gap-2 border-b border-border py-3">
      {editing ? (
        <form onSubmit={handleSubmit} noValidate className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold tabular-nums">{entry.number}</span>
          <input
            aria-label={`Słowo dla ${entry.number}`}
            value={word}
            maxLength={CUSTOM_PEG_WORD_MAX_LENGTH}
            onChange={(event) => setWord(event.target.value)}
            className="min-h-11 min-w-0 flex-1 basis-40 rounded-md border border-border bg-surface px-3 py-2"
          />
          <Button type="submit" disabled={saving}>
            Zapisz
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setWord(entry.word);
              setError(null);
              setEditing(false);
            }}
          >
            Anuluj
          </Button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="min-w-0 flex-1 basis-40 text-lg break-words">
            {`${entry.number} – ${entry.word}`}
          </span>
          <Button
            variant="secondary"
            aria-label={`Zmień wpis ${entry.number}`}
            onClick={() => setEditing(true)}
          >
            Zmień
          </Button>
          <Button
            variant="danger"
            aria-label={`Usuń wpis ${entry.number}`}
            disabled={saving}
            onClick={() =>
              run(async () => {
                await api<void>(`/api/peg-words/${entry.number}`, "DELETE");
                onRemoved(entry.number);
              })
            }
          >
            Usuń
          </Button>
        </div>
      )}
      <FieldError message={error} />
    </li>
  );
}

// Własne wpisy: dowolny ciąg 3–15 cyfr z własnym słowem lub frazą (np. 333 → mumia-mysz).
export function CustomPegSection({
  entries,
  onAdded,
  onChanged,
  onRemoved,
}: CustomPegSectionProps) {
  return (
    <section aria-label="Własne wpisy" className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">Własne wpisy</h2>
      <p className="text-text-secondary">
        Dla dłuższych liczb, np. numerów telefonu. Generator szuka ich najpierw, a resztę cyfr
        dzieli na pary.
      </p>
      <CustomPegForm onAdded={onAdded} />
      {entries.length === 0 ? (
        <p className="text-text-secondary">Nie masz jeszcze własnych wpisów.</p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <CustomPegRow
              key={entry.number}
              entry={entry}
              onChanged={onChanged}
              onRemoved={onRemoved}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
