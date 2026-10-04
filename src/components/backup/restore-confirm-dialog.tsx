import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { RestoreResultDto } from "@/lib/api-types";

// "Zostaną dodane 2 plansze", "Zostanie dodana 1 plansza", "Zostanie dodanych 5 plansz".
export function boardsAddedLabel(count: number): string {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (count === 1) return "Zostanie dodana 1 plansza";
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return `Zostaną dodane ${count} plansze`;
  }
  return `Zostanie dodanych ${count} plansz`;
}

interface RestoreConfirmDialogProps {
  preview: RestoreResultDto;
  onConfirm: () => void;
  onCancel: () => void;
}

// Przywracanie tylko dokłada dane — okno mówi, ile i czego zostanie dodane, zanim cokolwiek się zapisze.
export function RestoreConfirmDialog({ preview, onConfirm, onCancel }: RestoreConfirmDialogProps) {
  return (
    <ConfirmDialog
      title="Przywrócić kopię?"
      confirmLabel="Przywróć"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <p>{boardsAddedLabel(preview.boardsAdded)}</p>
      {preview.customPegWordsAdded > 0 && (
        <p>{`Własne wpisy GSP do dodania: ${preview.customPegWordsAdded}`}</p>
      )}
      {preview.pegWordsUpdated > 0 && (
        <p>{`Słowa GSP do uzupełnienia: ${preview.pegWordsUpdated}`}</p>
      )}
      <p className="mt-2">Istniejące plansze i zmienione słowa pozostaną bez zmian.</p>
    </ConfirmDialog>
  );
}
