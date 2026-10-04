"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiClientError, errorMessage } from "@/lib/api-client";
import type { BoardDetailDto, ConnectionDto, NoteDto, ZoneDto } from "@/lib/api-types";
import { BoardCanvas } from "./board-canvas";
import { BoardToolbar, type EditorMode } from "./board-toolbar";
import { Button } from "@/components/ui/button";
import { ConnectionPanel } from "./connection-panel";
import { NOTE_HEIGHT, NOTE_WIDTH, type Position } from "./dimensions";
import { Toast } from "@/components/ui/toast";
import { DEFAULT_NOTE_COLOR, type NoteColor } from "@/modules/notes/colors";
import { NoteEditor, type NoteEditorValues } from "./note-editor";
import { ReviewStart } from "./review-start";
import { ZoneEditor } from "./zone-editor";
import { ZONE_DEFAULT_HEIGHT, ZONE_DEFAULT_WIDTH, type ZoneRect } from "./zone-node";

type Panel =
  | { kind: "new-note"; position: Position }
  | { kind: "note"; noteId: string }
  | { kind: "connection"; connectionId: string }
  | { kind: "new-zone"; position: Position }
  | { kind: "zone"; zoneId: string }
  | null;

const IDLE: EditorMode = { kind: "idle" };

export function BoardEditorScreen({ boardId }: { boardId: string }) {
  const [board, setBoard] = useState<BoardDetailDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<EditorMode>(IDLE);
  const [panel, setPanel] = useState<Panel>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [reviewStartOpen, setReviewStartOpen] = useState(false);

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
      // Wskazany punkt planszy staje się środkiem nowej karteczki lub nowego pokoju.
      if (mode.kind === "place-note") {
        setMode(IDLE);
        setPanel({
          kind: "new-note",
          position: { x: position.x - NOTE_WIDTH / 2, y: position.y - NOTE_HEIGHT / 2 },
        });
      } else if (mode.kind === "place-zone") {
        setMode(IDLE);
        setPanel({
          kind: "new-zone",
          position: {
            x: position.x - ZONE_DEFAULT_WIDTH / 2,
            y: position.y - ZONE_DEFAULT_HEIGHT / 2,
          },
        });
      }
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
      if (mode.kind === "place-note" || mode.kind === "place-zone") return;
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

  const handleZoneClick = useCallback(
    (zoneId: string) => {
      if (mode.kind !== "idle") return;
      setPanel({ kind: "zone", zoneId });
    },
    [mode.kind],
  );

  // Przypisania karteczek do pokojów przelicza serwer — po zmianie strefy wczytujemy planszę.
  const handleZoneChange = useCallback(
    async (zoneId: string, rect: ZoneRect): Promise<void> => {
      setBoard(
        (current) =>
          current && {
            ...current,
            zones: current.zones.map((zone) => (zone.id === zoneId ? { ...zone, ...rect } : zone)),
          },
      );
      try {
        await api<ZoneDto>(`/api/zones/${zoneId}`, "PATCH", rect);
      } catch (error) {
        setToast(errorMessage(error));
      }
      await loadBoard();
    },
    [loadBoard],
  );

  async function createZone(position: Position, name: string): Promise<void> {
    await api<ZoneDto>(`/api/boards/${boardId}/zones`, "POST", {
      name,
      ...position,
      width: ZONE_DEFAULT_WIDTH,
      height: ZONE_DEFAULT_HEIGHT,
    });
    setPanel(null);
    await loadBoard();
  }

  async function renameZone(zoneId: string, name: string): Promise<void> {
    await api<ZoneDto>(`/api/zones/${zoneId}`, "PATCH", { name });
    setPanel(null);
    await loadBoard();
  }

  async function deleteZone(zoneId: string): Promise<void> {
    await api<void>(`/api/zones/${zoneId}`, "DELETE");
    setPanel(null);
    await loadBoard();
  }

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
      story: values.story || null,
      emoji: values.emoji || null,
      color: values.color,
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
        story: values.story || null,
        emoji: values.emoji || null,
        color: values.color,
      }),
    );
    setPanel(null);
  }

  async function changeNoteColor(noteId: string, color: NoteColor): Promise<void> {
    replaceNote(await api<NoteDto>(`/api/notes/${noteId}`, "PATCH", { color }));
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
  const editedZone =
    panel?.kind === "zone" ? board.zones.find((zone) => zone.id === panel.zoneId) : undefined;
  const topicOf = (noteId: string): string =>
    board.notes.find((note) => note.id === noteId)?.topic ?? "";

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <Toast message={toast} onDismiss={dismissToast} />
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2">
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold">{board.name}</h1>
        <Button className="shrink-0" onClick={() => setReviewStartOpen(true)}>
          Rozpocznij powtórkę
        </Button>
      </div>
      {reviewStartOpen && (
        <ReviewStart boardId={boardId} onCancel={() => setReviewStartOpen(false)} />
      )}
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
          zones={board.zones}
          connections={board.connections}
          onNoteMove={handleNoteMove}
          onNoteClick={handleNoteClick}
          onZoneChange={handleZoneChange}
          onZoneClick={handleZoneClick}
          onConnectionClick={handleConnectionClick}
          onPaneClick={handlePaneClick}
          placing={mode.kind === "place-note" || mode.kind === "place-zone"}
          highlightedNoteId={mode.kind === "connect" ? mode.sourceId : null}
          selectedConnectionId={selectedConnection?.id ?? null}
        />
        {board.notes.length === 0 &&
          board.zones.length === 0 &&
          mode.kind === "idle" &&
          panel === null && (
            <p className="pointer-events-none absolute inset-x-4 top-4 text-center text-text-secondary">
              Plansza jest pusta. Wybierz „Dodaj karteczkę” i wskaż miejsce.
            </p>
          )}
        {panel?.kind === "new-note" && (
          <NoteEditor
            title="Nowa karteczka"
            initial={{ topic: "", imageWords: "", story: "", emoji: "", color: DEFAULT_NOTE_COLOR }}
            onSave={(values) => createNote(panel.position, values)}
            onCancel={() => setPanel(null)}
          />
        )}
        {editedNote && (
          <NoteEditor
            key={editedNote.id}
            title="Edycja karteczki"
            initial={{
              topic: editedNote.topic,
              imageWords: editedNote.imageWords ?? "",
              story: editedNote.story ?? "",
              emoji: editedNote.emoji ?? "",
              color: editedNote.color,
            }}
            onSave={(values) => saveNote(editedNote.id, values)}
            onCancel={() => setPanel(null)}
            onDelete={() => deleteNote(editedNote.id)}
            onColorChange={(color) => changeNoteColor(editedNote.id, color)}
          />
        )}
        {panel?.kind === "new-zone" && (
          <ZoneEditor
            title="Nowy pokój"
            initialName=""
            onSave={(name) => createZone(panel.position, name)}
            onCancel={() => setPanel(null)}
          />
        )}
        {editedZone && (
          <ZoneEditor
            key={editedZone.id}
            title="Pokój"
            initialName={editedZone.name}
            onSave={(name) => renameZone(editedZone.id, name)}
            onCancel={() => setPanel(null)}
            onDelete={() => deleteZone(editedZone.id)}
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
