import { Button } from "@/components/ui/button";
import type { ConnectionKind } from "@/lib/api-types";

// Tryb pracy edytora: co oznacza następne dotknięcie planszy lub karteczki.
export type EditorMode =
  | { kind: "idle" }
  | { kind: "place-note" }
  | { kind: "connect"; connection: ConnectionKind; sourceId: string | null };

interface BoardToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

function modeHint(mode: EditorMode): string {
  switch (mode.kind) {
    case "place-note":
      return "Wskaż miejsce na planszy";
    case "connect":
      if (mode.sourceId === null) return "Wskaż pierwszą karteczkę";
      return mode.connection === "chain" ? "Wskaż następną karteczkę" : "Wskaż drugą karteczkę";
    default:
      return "";
  }
}

// Pasek narzędzi: na telefonie przyklejony do dołu ekranu, od md nad planszą.
export function BoardToolbar({ mode, onModeChange }: BoardToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Narzędzia planszy"
      className="order-last flex flex-wrap items-center gap-2 border-t border-border bg-surface px-4 py-2 md:order-none md:border-t-0 md:border-b"
    >
      {mode.kind === "idle" ? (
        <>
          <Button onClick={() => onModeChange({ kind: "place-note" })}>Dodaj karteczkę</Button>
          <Button
            variant="secondary"
            onClick={() =>
              onModeChange({ kind: "connect", connection: "association", sourceId: null })
            }
          >
            Połącz karteczki
          </Button>
          <Button
            variant="secondary"
            onClick={() => onModeChange({ kind: "connect", connection: "chain", sourceId: null })}
          >
            Połącz w łańcuch
          </Button>
        </>
      ) : (
        <>
          <p role="status" className="font-medium">
            {modeHint(mode)}
          </p>
          <Button variant="ghost" onClick={() => onModeChange({ kind: "idle" })}>
            {mode.kind === "connect" ? "Zakończ" : "Anuluj"}
          </Button>
        </>
      )}
    </div>
  );
}
