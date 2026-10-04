"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiClientError, apiJsonText, errorMessage } from "@/lib/api-client";
import type { BoardDto, RestoreResultDto } from "@/lib/api-types";
import { downloadFromApi } from "@/lib/download";
import { BACKUP_FILE_MAX_BYTES, BOARD_FILE_MAX_BYTES } from "@/modules/transfer/schema";
import { FileButton } from "./file-button";
import { RestoreConfirmDialog, boardsAddedLabel } from "./restore-confirm-dialog";

// FileReader zamiast File.text(), bo działa w każdej przeglądarce i w środowisku testowym.
function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// Za duży plik odrzucamy bez wysyłania; ten sam komunikat zwraca serwer.
const tooLarge = (limit: string) =>
  new ApiClientError(413, "FILE_TOO_LARGE", `Plik jest za duży (limit ${limit})`);

interface BackupPanelProps {
  // Wywoływane po zmianie danych (import, przywrócenie) — lista plansz wczytuje się od nowa.
  onDataChanged: () => void;
}

// Import planszy oraz pełna kopia: pliki z przeglądarki, nic nie jest przechowywane na serwerze.
export function BackupPanel({ onDataChanged }: BackupPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Wczytana kopia czeka na potwierdzenie; do zapisu wysyłamy ten sam tekst.
  const [pending, setPending] = useState<{ text: string; preview: RestoreResultDto } | null>(null);

  async function run(task: () => Promise<void>): Promise<void> {
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      await task();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  const importBoard = (file: File) =>
    run(async () => {
      if (file.size > BOARD_FILE_MAX_BYTES) throw tooLarge("5 MB");
      const board = await apiJsonText<BoardDto>(
        "/api/boards/import",
        "POST",
        await readFileText(file),
      );
      setStatus(`Zaimportowano planszę „${board.name}”`);
      onDataChanged();
    });

  const chooseBackup = (file: File) =>
    run(async () => {
      if (file.size > BACKUP_FILE_MAX_BYTES) throw tooLarge("50 MB");
      const text = await readFileText(file);
      const preview = await apiJsonText<RestoreResultDto>(
        "/api/backup/restore?dryRun=true",
        "POST",
        text,
      );
      setPending({ text, preview });
    });

  async function confirmRestore(): Promise<void> {
    if (!pending) return;
    const { text } = pending;
    setPending(null);
    await run(async () => {
      const result = await apiJsonText<RestoreResultDto>("/api/backup/restore", "POST", text);
      setStatus(`Przywrócono kopię. ${boardsAddedLabel(result.boardsAdded)}.`);
      onDataChanged();
    });
  }

  return (
    <section
      aria-label="Import i kopie zapasowe"
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <h2 className="text-lg font-bold">Import i kopie zapasowe</h2>
      <div className="flex flex-wrap gap-2" aria-busy={busy}>
        <FileButton label="Importuj planszę" onFile={importBoard} />
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => run(() => downloadFromApi("/api/backup"))}
        >
          Pobierz kopię
        </Button>
        <FileButton label="Przywróć z kopii" onFile={chooseBackup} />
      </div>
      <p className="text-sm text-text-secondary">
        Kopia zawiera wszystkie plansze, historię powtórek i listę GSP. Przywrócenie tylko dokłada
        dane — nic istniejącego nie jest zastępowane.
      </p>
      {status && (
        <p role="status" className="text-success">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="text-error">
          {error}
        </p>
      )}
      {pending && (
        <RestoreConfirmDialog
          preview={pending.preview}
          onConfirm={confirmRestore}
          onCancel={() => setPending(null)}
        />
      )}
    </section>
  );
}
