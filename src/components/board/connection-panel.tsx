import { Button } from "@/components/ui/button";
import { SidePanel } from "./side-panel";

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
    <SidePanel label="Połączenie">
      <div className="flex flex-col gap-3">
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
      </div>
    </SidePanel>
  );
}
