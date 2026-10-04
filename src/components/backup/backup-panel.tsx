"use client";

import { useState } from "react";
import { apiJsonText, errorMessage } from "@/lib/api-client";
import type { BoardDto } from "@/lib/api-types";
import { BOARD_FILE_MAX_BYTES } from "@/modules/transfer/schema";
import { FileButton } from "./file-button";

// FileReader zamiast File.text(), bo działa w każdej przeglądarce i w środowisku testowym.
function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

interface BackupPanelProps {
  // Wywoływane po udanym imporcie — lista plansz wczytuje się od nowa.
  onBoardImported: () => void;
}

// Import i kopie zapasowe plansz: pliki z przeglądarki, nic nie jest przechowywane na serwerze.
export function BackupPanel({ onBoardImported }: BackupPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function importBoard(file: File): Promise<void> {
    setError(null);
    setStatus(null);
    if (file.size > BOARD_FILE_MAX_BYTES) {
      setError("Plik jest za duży (limit 5 MB)");
      return;
    }
    setBusy(true);
    try {
      const board = await apiJsonText<BoardDto>(
        "/api/boards/import",
        "POST",
        await readFileText(file),
      );
      setStatus(`Zaimportowano planszę „${board.name}”`);
      onBoardImported();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="Import i kopie zapasowe"
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <h2 className="text-lg font-bold">Import i kopie zapasowe</h2>
      <div className="flex flex-wrap gap-2" aria-busy={busy}>
        <FileButton label="Importuj planszę" onFile={importBoard} />
      </div>
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
    </section>
  );
}
