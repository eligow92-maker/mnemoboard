"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { api, ApiClientError, errorMessage } from "@/lib/api-client";
import type { GeneratedWordImagesDto } from "@/lib/api-types";
import { SidePanel } from "./side-panel";
import { NOTE_TEXT_MAX_LENGTH, NOTE_TOPIC_REQUIRED_MESSAGE } from "@/modules/notes/schema";

export interface NoteEditorValues {
  topic: string;
  imageWords: string;
  story: string;
  emoji: string;
}

interface NoteEditorProps {
  title: string;
  initial: NoteEditorValues;
  onSave: (values: NoteEditorValues) => Promise<void>;
  onCancel: () => void;
  // Tylko dla istniejącej karteczki.
  onDelete?: () => Promise<void>;
}

export const NO_DIGITS_MESSAGE = "Brak liczb – wpisz słowa-obrazy samodzielnie";

export function NoteEditor({ title, initial, onSave, onCancel, onDelete }: NoteEditorProps) {
  const [topic, setTopic] = useState(initial.topic);
  const [imageWords, setImageWords] = useState(initial.imageWords);
  const [story, setStory] = useState(initial.story);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [emoji, setEmoji] = useState(initial.emoji);
  const [emojiError, setEmojiError] = useState<string | null>(null);
  // Wygenerowane słowa czekające na potwierdzenie zastąpienia dotychczasowych.
  const [pendingWords, setPendingWords] = useState<string | null>(null);
  const [wordsHint, setWordsHint] = useState<string | null>(null);
  const [topicError, setTopicError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const trimmedTopic = topic.trim();
    if (trimmedTopic === "") {
      setTopicError(NOTE_TOPIC_REQUIRED_MESSAGE);
      return;
    }

    setSaving(true);
    setTopicError(null);
    setStoryError(null);
    setEmojiError(null);
    setFormError(null);
    try {
      await onSave({
        topic: trimmedTopic,
        imageWords: imageWords.trim(),
        story: story.trim(),
        emoji: emoji.trim(),
      });
    } catch (caught) {
      const fields = caught instanceof ApiClientError ? caught.fields : {};
      if (fields.topic || fields.story || fields.emoji) {
        setTopicError(fields.topic ?? null);
        setStoryError(fields.story ?? null);
        setEmojiError(fields.emoji ?? null);
      } else setFormError(errorMessage(caught));
      setSaving(false);
    }
  }

  async function handleGenerate(): Promise<void> {
    if (topic.trim() === "") {
      setTopicError(NOTE_TOPIC_REQUIRED_MESSAGE);
      return;
    }
    setFormError(null);
    setWordsHint(null);
    try {
      const generated = await api<GeneratedWordImagesDto>("/api/word-images/generate", "POST", {
        topic,
      });
      if (imageWords.trim() === "") setImageWords(generated.imageWords);
      else if (generated.imageWords !== imageWords.trim()) setPendingWords(generated.imageWords);
    } catch (caught) {
      if (caught instanceof ApiClientError && caught.code === "NO_DIGITS") {
        setWordsHint(NO_DIGITS_MESSAGE);
      } else {
        setFormError(errorMessage(caught));
      }
    }
  }

  async function handleDelete(): Promise<void> {
    if (!onDelete) return;
    setSaving(true);
    setFormError(null);
    try {
      await onDelete();
    } catch (caught) {
      setFormError(errorMessage(caught));
      setSaving(false);
    }
  }

  return (
    <SidePanel label={title}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <TextAreaField
          id="note-topic"
          label="Zagadnienie"
          value={topic}
          maxLength={NOTE_TEXT_MAX_LENGTH}
          onChange={(event) => setTopic(event.target.value)}
          error={topicError}
          autoFocus
        />
        <TextAreaField
          id="note-image-words"
          label="Słowa-obrazy"
          value={imageWords}
          maxLength={NOTE_TEXT_MAX_LENGTH}
          onChange={(event) => setImageWords(event.target.value)}
        />
        <TextField
          id="note-emoji"
          label="Emotki"
          value={emoji}
          onChange={(event) => setEmoji(event.target.value)}
          error={emojiError}
        />
        <TextAreaField
          id="note-story"
          label="Opowiadanie"
          value={story}
          onChange={(event) => setStory(event.target.value)}
          error={storyError}
        />
        {wordsHint && (
          <p role="status" className="text-sm text-warning">
            {wordsHint}
          </p>
        )}
        <Button variant="secondary" className="self-start" onClick={handleGenerate}>
          Generuj słowa
        </Button>
        {formError && (
          <p role="alert" className="text-sm text-error">
            {formError}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving}>
            Zapisz
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Anuluj
          </Button>
          {onDelete && (
            <Button variant="danger" className="ml-auto" disabled={saving} onClick={handleDelete}>
              Usuń karteczkę
            </Button>
          )}
        </div>
      </form>
      {pendingWords !== null && (
        <ConfirmDialog
          title="Zastąpić słowa-obrazy?"
          confirmLabel="Zastąp"
          onConfirm={() => {
            setImageWords(pendingWords);
            setPendingWords(null);
          }}
          onCancel={() => setPendingWords(null)}
        >
          Obecne słowa „{imageWords}” zostaną zastąpione przez „{pendingWords}”.
        </ConfirmDialog>
      )}
    </SidePanel>
  );
}
