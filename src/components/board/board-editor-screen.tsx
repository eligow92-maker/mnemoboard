"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, ApiClientError, errorMessage } from "@/lib/api-client";
import type { BoardDetailDto, NoteDto } from "@/lib/api-types";
import { BoardCanvas, type Position } from "./board-canvas";
import { BoardToolbar } from "./board-toolbar";
import { NoteEditor, type NoteEditorValues } from "./note-editor";

// Rozmiar karteczki z tokenów — wskazany punkt planszy staje się środkiem nowej karteczki.
export const NOTE_WIDTH = 180;
export const NOTE_HEIGHT = 96;

type Panel = { kind: "new-note"; position: Position } | null;

export function BoardEditorScreen({ boardId }: { boardId: string }) {
  const [board, setBoard] = useState<BoardDetailDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [placingNote, setPlacingNote] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  useEffect(() => {
    let active = true;
    api<BoardDetailDto>(`/api/boards/${boardId}`)
      .then((loaded) => active && setBoard(loaded))
      .catch((error: unknown) => {
        if (!active) return;
        const missing =
          error instanceof ApiClientError && (error.status === 404 || error.status === 400);
        setLoadError(missing ? "Plansza nie istnieje" : errorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [boardId]);

  const handlePaneClick = useCallback(
    (position: Position) => {
      if (!placingNote) return;
      setPlacingNote(false);
      setPanel({
        kind: "new-note",
        position: { x: position.x - NOTE_WIDTH / 2, y: position.y - NOTE_HEIGHT / 2 },
      });
    },
    [placingNote],
  );

  const handleNoteMove = useCallback(() => {}, []);

  async function createNote(position: Position, values: NoteEditorValues): Promise<void> {
    const note = await api<NoteDto>(`/api/boards/${boardId}/notes`, "POST", {
      ...values,
      ...position,
    });
    setBoard((current) => current && { ...current, notes: [...current.notes, note] });
    setPanel(null);
  }

  if (loadError) {
    return (
      <main className="mx-auto flex w-full max-w-[960px] flex-col gap-3 p-4">
        <p role="alert" className="text-lg font-medium">
          {loadError}
        </p>
        <Link href="/" className="text-primary underline">
          Wróć do listy plansz
        </Link>
      </main>
    );
  }

  if (!board) {
    return <p className="p-4 text-text-secondary">Wczytywanie…</p>;
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2">
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold">{board.name}</h1>
      </div>
      <BoardToolbar
        placingNote={placingNote}
        onAddNote={() => {
          setPanel(null);
          setPlacingNote(true);
        }}
        onCancelPlacing={() => setPlacingNote(false)}
      />
      <div className="relative flex min-h-0 flex-1">
        <BoardCanvas
          notes={board.notes}
          onNoteMove={handleNoteMove}
          onPaneClick={handlePaneClick}
          placing={placingNote}
        />
        {board.notes.length === 0 && !placingNote && panel === null && (
          <p className="pointer-events-none absolute inset-x-4 top-4 text-center text-text-secondary">
            Plansza jest pusta. Wybierz „Dodaj karteczkę” i wskaż miejsce.
          </p>
        )}
        {panel?.kind === "new-note" && (
          <NoteEditor
            title="Nowa karteczka"
            initial={{ topic: "" }}
            onSave={(values) => createNote(panel.position, values)}
            onCancel={() => setPanel(null)}
          />
        )}
      </div>
    </main>
  );
}
