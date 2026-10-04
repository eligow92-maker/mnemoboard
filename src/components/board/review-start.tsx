"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { NOTE_COLORS, type NoteColor } from "@/modules/notes/colors";
import { ColorFilter } from "./color-filter";

interface ReviewStartProps {
  boardId: string;
  onCancel: () => void;
}

const LINK_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 font-medium text-white hover:bg-primary-dark";

// Okno rozpoczęcia powtórki: wybór kolorów karteczek (domyślnie wszystkie), potem przejście do powtórki.
export function ReviewStart({ boardId, onCancel }: ReviewStartProps) {
  const titleId = useId();
  const [selected, setSelected] = useState<ReadonlySet<NoteColor>>(new Set(NOTE_COLORS));

  function toggle(color: NoteColor): void {
    const next = new Set(selected);
    if (!next.delete(color)) next.add(color);
    setSelected(next);
  }

  // Wszystkie kolory = brak filtra, więc adres pozostaje taki jak przed wprowadzeniem filtra.
  const chosen = NOTE_COLORS.filter((color) => selected.has(color));
  const href =
    chosen.length === NOTE_COLORS.length
      ? `/boards/${boardId}/review`
      : `/boards/${boardId}/review?colors=${chosen.join(",")}`;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex w-full max-w-sm flex-col gap-3 rounded-lg bg-surface p-4 shadow-lg"
      >
        <h2 id={titleId} className="text-lg font-bold">
          Rozpocznij powtórkę
        </h2>
        <p className="text-text-secondary">Powtórz tylko karteczki w wybranych kolorach.</p>
        <ColorFilter selected={selected} onToggle={toggle} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Anuluj
          </Button>
          {chosen.length > 0 ? (
            <Link href={href} className={LINK_CLASS}>
              Rozpocznij
            </Link>
          ) : (
            <Button disabled>Rozpocznij</Button>
          )}
        </div>
      </div>
    </div>
  );
}
