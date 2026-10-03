"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiClientError, errorMessage } from "@/lib/api-client";
import type { BoardDetailDto, ConnectionDto, NoteDto } from "@/lib/api-types";
import { BoardCanvas } from "./board-canvas";
import { BoardToolbar, type EditorMode } from "./board-toolbar";
import { ConnectionPanel } from "./connection-panel";
import { NOTE_HEIGHT, NOTE_WIDTH, type Position } from "./dimensions";
import { Toast } from "@/components/ui/toast";
import { NoteEditor, type NoteEditorValues } from "./note-editor";

type Panel =
  | { kind: "new-note"; position: Position }
  | { kind: "note"; noteId: string }
  | { kind: "connection"; connectionId: string }
  | null;

const IDLE: EditorMode = { kind: "idle" };

export function BoardEditorScreen({ boardId }: { boardId: string }) {
  const [board, setBoard] = useState<BoardDetailDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<EditorMode>(IDLE);
  const [panel, setPanel] = useState<Panel>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Numer ostatniego wczytania — spóźniona odpowiedź starszego żądania nie nadpisze nowszej.
  const loadSequence = useRef(0);

  const loadBoard = useCallback(async (): Promise<void> => {
    const sequence = ++loadSequence.current;
    try {
      const loaded = await api<BoardDetailDto>(`/api/boards/${boardId}`);
      if (sequence === loadSequence.current) setBoard(loaded);
    } catch (error) {
      if (sequence !== loadSequence.current) return;
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
      if (mode.kind !== "place-note") return;
      setMode(IDLE);
      // Wskazany punkt planszy staje się środkiem nowej karteczki.
      setPanel({
        kind: "new-note",
        position: { x: position.x - NOTE_WIDTH / 2, y: position.y - NOTE_HEIGHT / 2 },
      });
    },
    [mode.kind],
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

  // Numery łańcucha wylicza serwer, więc po zmianie połączeń plansza jest wczytywana ponownie.
  const connect = useCallback(
    async (sourceNoteId: string, targetNoteId: string, kind: ConnectionDto["kind"]) => {
      try {
        await api<ConnectionDto>(`/api/boards/${boardId}/connections`, "POST", {
          sourceNoteId,
          targetNoteId,
          kind,
        });
        await loadBoard();
      } catch (error) {
        setToast(errorMessage(error));
      }
    },
    [boardId, loadBoard],
  );

  const handleNoteClick = useCallback(
    (noteId: string) => {
      if (mode.kind === "place-note") return;
      if (mode.kind === "connect") {
        if (mode.sourceId === null) {
          setMode({ ...mode, sourceId: noteId });
        } else if (mode.sourceId !== noteId) {
          void connect(mode.sourceId, noteId, mode.connection);
          // W łańcuchu wskazana karteczka staje się początkiem następnego ogniwa.
          setMode({ ...mode, sourceId: mode.connection === "chain" ? noteId : null });
        }
        return;
      }
      setPanel({ kind: "note", noteId });
    },
    [mode, connect],
  );

  const handleConnectionClick = useCallback(
    (connectionId: string) => {
      if (mode.kind !== "idle") return;
      setPanel({ kind: "connection", connectionId });
    },
    [mode.kind],
  );

  async function deleteConnection(connectionId: string): Promise<void> {
    try {
      await api<void>(`/api/connections/${connectionId}`, "DELETE");
      setPanel(null);
      await loadBoard();
    } catch (error) {
      setToast(errorMessage(error));
    }
  }

  async function createNote(position: Position, values: NoteEditorValues): Promise<void> {
    const note = await api<NoteDto>(`/api/boards/${boardId}/notes`, "POST", {
      topic: values.topic,
      imageWords: values.imageWords || null,
      ...position,
    });
    setBoard((current) => current && { ...current, notes: [...current.notes, note] });
    setPanel(null);
  }

  async function saveNote(noteId: string, values: NoteEditorValues): Promise<void> {
    replaceNote(
      await api<NoteDto>(`/api/notes/${noteId}`, "PATCH", {
        topic: values.topic,
        imageWords: values.imageWords || null,
      }),
    );
    setPanel(null);
  }

  async function deleteNote(noteId: string): Promise<void> {
    await api<void>(`/api/notes/${noteId}`, "DELETE");
    setPanel(null);
    await loadBoard();
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
  const selectedConnection =
    panel?.kind === "connection"
      ? board.connections.find((connection) => connection.id === panel.connectionId)
      : undefined;
  const topicOf = (noteId: string): string =>
    board.notes.find((note) => note.id === noteId)?.topic ?? "";

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <Toast message={toast} onDismiss={dismissToast} />
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2">
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold">{board.name}</h1>
      </div>
      <BoardToolbar
        mode={mode}
        onModeChange={(next) => {
          setPanel(null);
          setMode(next);
        }}
      />
      <div className="relative flex min-h-0 flex-1">
        <BoardCanvas
          notes={board.notes}
          connections={board.connections}
          onNoteMove={handleNoteMove}
          onNoteClick={handleNoteClick}
          onConnectionClick={handleConnectionClick}
          onPaneClick={handlePaneClick}
          placing={mode.kind === "place-note"}
          highlightedNoteId={mode.kind === "connect" ? mode.sourceId : null}
          selectedConnectionId={selectedConnection?.id ?? null}
        />
        {board.notes.length === 0 && mode.kind === "idle" && panel === null && (
          <p className="pointer-events-none absolute inset-x-4 top-4 text-center text-text-secondary">
            Plansza jest pusta. Wybierz „Dodaj karteczkę” i wskaż miejsce.
          </p>
        )}
        {panel?.kind === "new-note" && (
          <NoteEditor
            title="Nowa karteczka"
            initial={{ topic: "", imageWords: "" }}
            onSave={(values) => createNote(panel.position, values)}
            onCancel={() => setPanel(null)}
          />
        )}
        {editedNote && (
          <NoteEditor
            key={editedNote.id}
            title="Edycja karteczki"
            initial={{ topic: editedNote.topic, imageWords: editedNote.imageWords ?? "" }}
            onSave={(values) => saveNote(editedNote.id, values)}
            onCancel={() => setPanel(null)}
            onDelete={() => deleteNote(editedNote.id)}
          />
        )}
        {selectedConnection && (
          <ConnectionPanel
            sourceTopic={topicOf(selectedConnection.sourceNoteId)}
            targetTopic={topicOf(selectedConnection.targetNoteId)}
            chain={selectedConnection.kind === "chain"}
            onDelete={() => deleteConnection(selectedConnection.id)}
            onClose={() => setPanel(null)}
          />
        )}
      </div>
    </main>
  );
}
