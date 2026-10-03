import { Button } from "@/components/ui/button";

interface BoardToolbarProps {
  placingNote: boolean;
  onAddNote: () => void;
  onCancelPlacing: () => void;
}

// Pasek narzędzi: na telefonie przyklejony do dołu ekranu, od md nad planszą.
export function BoardToolbar({ placingNote, onAddNote, onCancelPlacing }: BoardToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Narzędzia planszy"
      className="order-last flex flex-wrap items-center gap-2 border-t border-border bg-surface px-4 py-2 md:order-none md:border-t-0 md:border-b"
    >
      {placingNote ? (
        <>
          <p role="status" className="font-medium">
            Wskaż miejsce na planszy
          </p>
          <Button variant="ghost" onClick={onCancelPlacing}>
            Anuluj
          </Button>
        </>
      ) : (
        <Button onClick={onAddNote}>Dodaj karteczkę</Button>
      )}
    </div>
  );
}
