"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, ApiClientError, errorMessage } from "@/lib/api-client";
import type { BoardDetailDto, NoteDto } from "@/lib/api-types";
import { BoardCanvas, type Position } from "./board-canvas";
import { BoardToolbar } from "./board-toolbar";
import { Toast } from "@/components/ui/toast";
import { NoteEditor, type NoteEditorValues } from "./note-editor";

// Rozmiar karteczki z tokenów — wskazany punkt planszy staje się środkiem nowej karteczki.
export const NOTE_WIDTH = 180;
export const NOTE_HEIGHT = 96;

type Panel = { kind: "new-note"; position: Position } | { kind: "note"; noteId: string } | null;

export function BoardEditorScreen({ boardId }: { boardId: string }) {
  const [board, setBoard] = useState<BoardDetailDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [placingNote, setPlacingNote] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadBoard = useCallback(async (): Promise<void> => {
    try {
      setBoard(await api<BoardDetailDto>(`/api/boards/${boardId}`));
    } catch (error) {
      const missing =
        error instanceof ApiClientError && (error.status === 404 || error.status === 400);
      setLoadError(missing ? "Plansza nie istnieje" : errorMessage(error));
    }
  }, [boardId]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  const dismissToast = useCallback(() => setToast(null), []);

  const replaceNote = useCallback((note: NoteDto) => {
    setBoard(
      (current) =>
        current && {
          ...current,
          notes: current.notes.map((existing) => (existing.id === note.id ? note : existing)),
        },
    );
  }, []);

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

  // Położenie zapisywane raz, po upuszczeniu; przy błędzie wracamy do stanu z serwera.
  const handleNoteMove = useCallback(
    async (noteId: string, position: Position): Promise<void> => {
      setBoard(
        (current) =>
          current && {
            ...current,
            notes: current.notes.map((note) =>
              note.id === noteId ? { ...note, ...position } : note,
            ),
          },
      );
      try {
        replaceNote(await api<NoteDto>(`/api/notes/${noteId}`, "PATCH", position));
      } catch (error) {
        setToast(errorMessage(error));
        await loadBoard();
      }
    },
    [loadBoard, replaceNote],
  );

  const handleNoteClick = useCallback(
    (noteId: string) => {
      if (placingNote) return;
      setPanel({ kind: "note", noteId });
    },
    [placingNote],
  );

  async function createNote(position: Position, values: NoteEditorValues): Promise<void> {
    const note = await api<NoteDto>(`/api/boards/${boardId}/notes`, "POST", {
      ...values,
      ...position,
    });
    setBoard((current) => current && { ...current, notes: [...current.notes, note] });
    setPanel(null);
  }

  async function saveNote(noteId: string, values: NoteEditorValues): Promise<void> {
    replaceNote(await api<NoteDto>(`/api/notes/${noteId}`, "PATCH", values));
    setPanel(null);
  }

  async function deleteNote(noteId: string): Promise<void> {
    await api<void>(`/api/notes/${noteId}`, "DELETE");
    setBoard(
      (current) =>
        current && {
          ...current,
          notes: current.notes.filter((note) => note.id !== noteId),
          connections: current.connections.filter(
            (connection) =>
              connection.sourceNoteId !== noteId && connection.targetNoteId !== noteId,
          ),
        },
    );
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

  const editedNote =
    panel?.kind === "note" ? board.notes.find((note) => note.id === panel.noteId) : undefined;

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <Toast message={toast} onDismiss={dismissToast} />
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
          onNoteClick={handleNoteClick}
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
        {editedNote && (
          <NoteEditor
            key={editedNote.id}
            title="Edycja karteczki"
            initial={{ topic: editedNote.topic }}
            onSave={(values) => saveNote(editedNote.id, values)}
            onCancel={() => setPanel(null)}
            onDelete={() => deleteNote(editedNote.id)}
          />
        )}
      </div>
    </main>
  );
}
