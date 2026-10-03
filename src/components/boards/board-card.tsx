"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { errorMessage } from "@/lib/api-client";
import type { BoardSummaryDto } from "@/lib/api-types";
import { formatDate } from "@/lib/format";
import { BoardForm } from "./board-form";

export function noteCountLabel(count: number): string {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (count === 1) return "1 karteczka";
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return `${count} karteczki`;
  }
  return `${count} karteczek`;
}

interface BoardCardProps {
  board: BoardSummaryDto;
  onRename: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function BoardCard({ board, onRename, onDelete }: BoardCardProps) {
  const [renaming, setRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(): Promise<void> {
    setConfirmingDelete(false);
    setError(null);
    try {
      await onDelete();
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  return (
    <li className="flex flex-col rounded-lg border border-border bg-surface shadow-sm">
      <Link href={`/boards/${board.id}`} className="flex min-h-11 flex-col gap-1 p-4">
        <span className="text-lg font-bold break-words">{board.name}</span>
        <span className="text-sm text-text-secondary">{noteCountLabel(board.noteCount)}</span>
        {board.lastReview ? (
          <span className="text-sm">
            Ostatnia powtórka:{" "}
            <strong className={board.lastReview.percent >= 80 ? "text-success" : undefined}>
              {board.lastReview.percent}%
            </strong>{" "}
            · {formatDate(board.lastReview.finishedAt)}
          </span>
        ) : (
          <span className="text-sm text-text-secondary">Brak powtórek</span>
        )}
      </Link>

      {renaming ? (
        <div className="border-t border-border p-4">
          <BoardForm
            initialName={board.name}
            submitLabel="Zapisz"
            onSubmit={async (name) => {
              await onRename(name);
              setRenaming(false);
            }}
            onCancel={() => setRenaming(false)}
          />
        </div>
      ) : (
        <div className="flex gap-1 border-t border-border px-2 py-1">
          <Button variant="ghost" onClick={() => setRenaming(true)}>
            Zmień nazwę
          </Button>
          <Button variant="ghost" className="text-error" onClick={() => setConfirmingDelete(true)}>
            Usuń
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="px-4 pb-3 text-sm text-error">
          {error}
        </p>
      )}

      {confirmingDelete && (
        <ConfirmDialog
          title="Usunąć planszę?"
          confirmLabel="Usuń planszę"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        >
          Plansza „{board.name}” zostanie usunięta razem z karteczkami, połączeniami, pokojami i
          wynikami powtórek. Tej operacji nie można cofnąć.
        </ConfirmDialog>
      )}
    </li>
  );
}
