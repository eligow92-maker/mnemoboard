import Link from "next/link";
import type { BoardSummaryDto } from "@/lib/api-types";
import { formatDate } from "@/lib/format";

export function noteCountLabel(count: number): string {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (count === 1) return "1 karteczka";
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14))
    return `${count} karteczki`;
  return `${count} karteczek`;
}

export function BoardCard({ board }: { board: BoardSummaryDto }) {
  return (
    <li className="rounded-lg border border-border bg-surface shadow-sm">
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
    </li>
  );
}
