import type { ChangeEvent } from "react";

interface FileButtonProps {
  label: string;
  accept?: string;
  onFile: (file: File) => void;
}

// Przycisk wyboru pliku: etykieta wygląda jak przycisk, a pole pliku jest ukryte wizualnie,
// ale dostępne dla czytników ekranu i testów (etykieta = nazwa pola).
export function FileButton({ label, accept = ".json,application/json", onFile }: FileButtonProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    // Pozwala wybrać ten sam plik ponownie.
    event.target.value = "";
    if (file) onFile(file);
  }

  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-4 font-medium text-text-primary focus-within:ring-2 focus-within:ring-primary hover:bg-background">
      {label}
      <input type="file" accept={accept} onChange={handleChange} className="sr-only" />
    </label>
  );
}
