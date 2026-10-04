import { NOTE_COLORS, NOTE_COLOR_LABELS, type NoteColor } from "@/modules/notes/colors";
import { NOTE_COLOR_CLASSES } from "./note-colors";

interface ColorFilterProps {
  selected: ReadonlySet<NoteColor>;
  onToggle: (color: NoteColor) => void;
}

// Wybór wielu kolorów (filtr powtórki); próbka 32 px w polu dotyku 44 px.
export function ColorFilter({ selected, onToggle }: ColorFilterProps) {
  return (
    <div role="group" aria-label="Kolory karteczek w powtórce" className="flex flex-wrap gap-1">
      {NOTE_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          role="checkbox"
          aria-checked={selected.has(color)}
          aria-label={NOTE_COLOR_LABELS[color]}
          onClick={() => onToggle(color)}
          className="flex h-11 w-11 items-center justify-center rounded-full"
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${NOTE_COLOR_CLASSES[color]} ${
              selected.has(color) ? "ring-2 ring-primary ring-offset-2" : "opacity-50"
            }`}
          >
            {selected.has(color) ? "✓" : ""}
          </span>
        </button>
      ))}
    </div>
  );
}
