const DATE_FORMAT = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

// Data w zapisie polskim, np. "4.10.2026".
export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}
