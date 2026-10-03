import { Button } from "@/components/ui/button";

interface ConnectionPanelProps {
  sourceTopic: string;
  targetTopic: string;
  chain: boolean;
  onDelete: () => void;
  onClose: () => void;
}

// Panel wybranego połączenia: pokazuje, co łączy linia, i pozwala ją usunąć.
export function ConnectionPanel({
  sourceTopic,
  targetTopic,
  chain,
  onDelete,
  onClose,
}: ConnectionPanelProps) {
  return (
    <aside
      aria-label="Połączenie"
      className="fixed inset-x-0 bottom-0 z-20 flex flex-col gap-3 rounded-t-lg border border-border bg-surface p-4 shadow-lg md:static md:w-80 md:shrink-0 md:rounded-none md:border-y-0 md:border-r-0 md:shadow-none"
    >
      <h2 className="text-lg font-bold">{chain ? "Ogniwo łańcucha" : "Połączenie"}</h2>
      <p className="break-words">
        {sourceTopic} {chain ? "→" : "—"} {targetTopic}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="danger" onClick={onDelete}>
          Usuń połączenie
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Zamknij
        </Button>
      </div>
    </aside>
  );
}
