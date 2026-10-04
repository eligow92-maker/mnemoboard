import type { ReactNode } from "react";

// Panel edycji: arkusz dolny na telefonie, panel boczny od md.
export function SidePanel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <aside
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-20 max-h-[80dvh] overflow-y-auto rounded-t-lg border border-border bg-surface p-4 shadow-lg md:static md:max-h-none md:w-80 md:shrink-0 md:rounded-none md:border-y-0 md:border-r-0 md:shadow-none"
    >
      {children}
    </aside>
  );
}
