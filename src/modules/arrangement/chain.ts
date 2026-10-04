// Czysta logika łańcucha skojarzeń: ogniwa to skierowane połączenia kind=chain.
// Karteczka ma najwyżej jeden następnik i jeden poprzednik, a łańcuch nie tworzy pętli.

export interface ChainLink {
  sourceNoteId: string;
  targetNoteId: string;
}

export type ChainViolation = "CHAIN_SUCCESSOR_EXISTS" | "CHAIN_PREDECESSOR_EXISTS" | "CHAIN_CYCLE";

export const CHAIN_VIOLATION_MESSAGES: Record<ChainViolation, string> = {
  CHAIN_SUCCESSOR_EXISTS: "Karteczka ma już następnik w łańcuchu",
  CHAIN_PREDECESSOR_EXISTS: "Karteczka ma już poprzednik w łańcuchu",
  CHAIN_CYCLE: "Łańcuch nie może tworzyć pętli",
};

function successors(links: ChainLink[]): Map<string, string> {
  return new Map(links.map((link) => [link.sourceNoteId, link.targetNoteId]));
}

function predecessors(links: ChainLink[]): Map<string, string> {
  return new Map(links.map((link) => [link.targetNoteId, link.sourceNoteId]));
}

// Łańcuchy jako listy karteczek od pierwszej do ostatniej, w kolejności pierwszego ogniwa na liście.
export function chains(links: ChainLink[]): string[][] {
  const next = successors(links);
  const previous = predecessors(links);
  const seen = new Set<string>();
  const result: string[][] = [];

  for (const link of links) {
    if (seen.has(link.sourceNoteId)) continue;

    let head = link.sourceNoteId;
    const walkedBack = new Set([head]);
    for (let before = previous.get(head); before !== undefined; before = previous.get(before)) {
      // Zabezpieczenie przed pętlą w danych — reguły nie powinny do niej dopuścić.
      if (walkedBack.has(before)) break;
      walkedBack.add(before);
      head = before;
    }

    const chain: string[] = [];
    for (let note: string | undefined = head; note !== undefined; note = next.get(note)) {
      if (seen.has(note)) break;
      seen.add(note);
      chain.push(note);
    }
    result.push(chain);
  }
  return result;
}

// Numer kolejności (od 1) każdej karteczki należącej do łańcucha.
export function chainPositions(links: ChainLink[]): Map<string, number> {
  const positions = new Map<string, number>();
  for (const chain of chains(links)) {
    chain.forEach((noteId, index) => positions.set(noteId, index + 1));
  }
  return positions;
}

// Sprawdza, czy do istniejących ogniw można dodać ogniwo source→target.
export function validateChainLink(
  links: ChainLink[],
  sourceNoteId: string,
  targetNoteId: string,
): ChainViolation | null {
  const next = successors(links);
  if (next.has(sourceNoteId)) return "CHAIN_SUCCESSOR_EXISTS";
  if (predecessors(links).has(targetNoteId)) return "CHAIN_PREDECESSOR_EXISTS";

  // Pętla powstaje, gdy idąc od celu po następnikach, dochodzimy do źródła.
  const visited = new Set<string>();
  for (
    let note: string | undefined = targetNoteId;
    note !== undefined && !visited.has(note);
    note = next.get(note)
  ) {
    if (note === sourceNoteId) return "CHAIN_CYCLE";
    visited.add(note);
  }
  return null;
}
