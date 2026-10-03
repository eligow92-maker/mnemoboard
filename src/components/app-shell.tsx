import Link from "next/link";
import type { ReactNode } from "react";

const NAV_LINKS = [
  { href: "/", label: "Plansze" },
  { href: "/peg-words", label: "Lista GSP" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-text-primary">
      <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-2">
        <Link href="/" className="text-lg font-bold text-primary">
          Mnemoboard
        </Link>
        <nav aria-label="Główna nawigacja" className="flex gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center rounded-md px-3 font-medium hover:bg-background"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
