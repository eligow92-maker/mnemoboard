import { chains, type ChainLink } from "@/modules/arrangement/chain";

export interface OrderableNote {
  id: string;
  createdAt: Date;
}

// Kolejność kart powtórki: najpierw łańcuchy po kolei (łańcuchy ułożone według daty utworzenia
// ich pierwszej karteczki), potem pozostałe karteczki według daty utworzenia.
// `notes` to karteczki biorące udział w powtórce; ogniwa mogą wskazywać także inne karteczki.
export function reviewOrder(notes: OrderableNote[], chainLinks: ChainLink[]): string[] {
  const createdAt = new Map(notes.map((note) => [note.id, note.createdAt.getTime()]));
  const time = (noteId: string): number => createdAt.get(noteId) ?? 0;

  const orderedChains = chains(chainLinks)
    .map((chain) => chain.filter((noteId) => createdAt.has(noteId)))
    .filter((chain) => chain.length > 0)
    .sort((a, b) => time(a[0]) - time(b[0]));

  const inChain = new Set(orderedChains.flat());
  const loose = notes
    .filter((note) => !inChain.has(note.id))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((note) => note.id);

  return [...orderedChains.flat(), ...loose];
}
