"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NoteColor } from "@/modules/notes/colors";
import { NOTE_COLOR_CLASSES } from "@/components/board/note-colors";
import { Button } from "@/components/ui/button";
import { api, ApiClientError, errorMessage } from "@/lib/api-client";
import type { ReviewCardDto, ReviewSessionStartDto, ReviewSummaryDto } from "@/lib/api-types";

const LINK_BUTTON_CLASS =
  "inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 font-medium text-white hover:bg-primary-dark";

// Co jeszcze, poza słowami-obrazami, jest zakryte do "Odsłoń".
function hiddenLabel(card: ReviewCardDto): string {
  const extras = [card.story !== null && "opowiadanie", card.emoji !== null && "emotki"].filter(
    (extra): extra is string => extra !== false,
  );
  const parts = ["Słowa-obrazy", ...extras];
  const last = parts.pop();
  return `${parts.length > 0 ? `${parts.join(", ")} i ` : ""}${last} są zakryte.`;
}

function ReviewCard({ card, revealed }: { card: ReviewCardDto; revealed: boolean }) {
  return (
    <section
      aria-label="Karteczka"
      className={`flex min-h-48 flex-col gap-4 rounded-lg border p-4 shadow-note ${NOTE_COLOR_CLASSES[card.color]}`}
    >
      <p
        data-testid="review-topic"
        className="text-[1.75rem] leading-tight font-bold break-words whitespace-pre-wrap"
      >
        {card.topic}
      </p>
      {revealed ? (
        <div className="flex min-w-0 flex-col items-start gap-2">
          {card.emoji !== null && (
            <p className="text-emoji-review leading-tight break-words">{card.emoji}</p>
          )}
          <p className="max-w-full text-xl break-words whitespace-pre-wrap">{card.imageWords}</p>
          {card.story !== null && (
            <p className="max-w-full break-words whitespace-pre-wrap text-text-secondary italic">
              {card.story}
            </p>
          )}
          {card.zoneName !== null && (
            <span
              aria-label={`Pokój: ${card.zoneName}`}
              className="max-w-full rounded-lg bg-secondary px-3 py-1 text-sm font-medium break-words text-white"
            >
              {card.zoneName}
            </span>
          )}
        </div>
      ) : (
        <p className="text-text-secondary">{hiddenLabel(card)}</p>
      )}
    </section>
  );
}

function ReviewSummary({ summary, boardId }: { summary: ReviewSummaryDto; boardId: string }) {
  return (
    <section
      aria-label="Podsumowanie"
      className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-6 text-center"
    >
      <h2 className="text-xl font-bold">Koniec powtórki</h2>
      <p
        className={`text-5xl font-bold ${summary.percent >= 80 ? "text-success" : "text-primary"}`}
      >
        {summary.percent}%
      </p>
      <p className="text-lg">
        Zapamiętane: <strong>{`${summary.rememberedCount} z ${summary.totalCount}`}</strong>
      </p>
      <Link href={`/boards/${boardId}`} className={LINK_BUTTON_CLASS}>
        Wróć do planszy
      </Link>
    </section>
  );
}

function ReviewUnavailable({ boardId, inColors }: { boardId: string; inColors: boolean }) {
  return (
    <section
      aria-label="Powtórka niedostępna"
      className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface p-6 text-center"
    >
      <p className="text-lg font-medium">
        {inColors
          ? "Brak karteczek w wybranych kolorach"
          : "Dodaj słowa-obrazy, aby rozpocząć powtórkę"}
      </p>
      <p className="text-text-secondary">
        {inColors
          ? "Wybierz inne kolory albo wróć do planszy i dodaj słowa-obrazy karteczkom w tych kolorach."
          : "W powtórce biorą udział tylko karteczki, które mają słowa-obrazy."}
      </p>
      <Link href={`/boards/${boardId}`} className={LINK_BUTTON_CLASS}>
        Wróć do planszy
      </Link>
    </section>
  );
}

// Powtórka: zagadnienie → "Odsłoń" → samoocena → następna karta → podsumowanie.
export function ReviewScreen({
  boardId,
  colors,
}: {
  boardId: string;
  // Zawężenie powtórki do wybranych kolorów; brak = wszystkie.
  colors?: NoteColor[];
}) {
  const [session, setSession] = useState<ReviewSessionStartDto | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [summary, setSummary] = useState<ReviewSummaryDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const colorsKey = colors?.join(",") ?? "";
  const [saving, setSaving] = useState(false);
  // Sesję zakładamy raz — także wtedy, gdy React w trybie dev uruchamia efekt dwukrotnie.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    api<ReviewSessionStartDto>(
      `/api/boards/${boardId}/review-sessions`,
      "POST",
      colorsKey === "" ? undefined : { colors: colorsKey.split(",") },
    )
      .then(setSession)
      .catch((caught: unknown) => {
        if (
          caught instanceof ApiClientError &&
          (caught.code === "NO_REVIEWABLE_NOTES" || caught.code === "NO_NOTES_IN_COLORS")
        ) {
          setUnavailable(caught.code);
        } else {
          setError(errorMessage(caught));
        }
      });
  }, [boardId, colorsKey]);

  async function answer(remembered: boolean): Promise<void> {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      await api(`/api/review-sessions/${session.id}/results`, "POST", {
        noteId: session.cards[index].noteId,
        remembered,
      });
      if (index + 1 < session.cards.length) {
        setIndex(index + 1);
        setRevealed(false);
      } else {
        setSummary(
          await api<ReviewSummaryDto>(`/api/review-sessions/${session.id}/finish`, "POST"),
        );
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  const card = session?.cards[index];

  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Powtórka</h1>
        {session && card && !summary && (
          <p className="font-medium text-text-secondary">
            {`Karta ${index + 1} z ${session.cards.length}`}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-error">
          {error}
        </p>
      )}
      {!session && !error && unavailable === null && (
        <p className="text-text-secondary">Wczytywanie…</p>
      )}
      {unavailable !== null && (
        <ReviewUnavailable boardId={boardId} inColors={unavailable === "NO_NOTES_IN_COLORS"} />
      )}

      {summary && <ReviewSummary summary={summary} boardId={boardId} />}

      {card && !summary && (
        <>
          <ReviewCard card={card} revealed={revealed} />
          {revealed ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="w-full bg-success hover:bg-success"
                disabled={saving}
                onClick={() => answer(true)}
              >
                Pamiętałem
              </Button>
              <Button
                variant="danger"
                className="w-full"
                disabled={saving}
                onClick={() => answer(false)}
              >
                Nie pamiętałem
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={() => setRevealed(true)}>
              Odsłoń
            </Button>
          )}
        </>
      )}

      {!summary && unavailable === null && (
        <Link href={`/boards/${boardId}`} className="self-start py-2 text-primary underline">
          Wróć do planszy
        </Link>
      )}
    </main>
  );
}
