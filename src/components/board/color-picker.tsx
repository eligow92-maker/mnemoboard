import { NOTE_COLORS, NOTE_COLOR_LABELS, type NoteColor } from "@/modules/notes/colors";
import { NOTE_COLOR_CLASSES } from "./note-colors";

interface ColorPickerProps {
  value: NoteColor;
  onChange: (color: NoteColor) => void;
}

// Wybór jednego z pięciu kolorów karteczki; próbka 32 px w polu dotyku 44 px.
export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div role="radiogroup" aria-label="Kolor karteczki" className="flex flex-wrap gap-1">
      {NOTE_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={color === value}
          aria-label={NOTE_COLOR_LABELS[color]}
          onClick={() => onChange(color)}
          className="flex h-11 w-11 items-center justify-center rounded-full"
        >
          <span
            className={`h-8 w-8 rounded-full border ${NOTE_COLOR_CLASSES[color]} ${
              color === value ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
          />
        </button>
      ))}
    </div>
  );
}
