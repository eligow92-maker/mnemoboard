// Odsetek zapamiętanych karteczek, zaokrąglony do liczby całkowitej.
export function percent(remembered: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((remembered / total) * 100);
}
