"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextAreaField } from "@/components/ui/field";
import { ApiClientError, errorMessage } from "@/lib/api-client";
import { NOTE_TEXT_MAX_LENGTH, NOTE_TOPIC_REQUIRED_MESSAGE } from "@/modules/notes/schema";

export interface NoteEditorValues {
  topic: string;
}

interface NoteEditorProps {
  title: string;
  initial: NoteEditorValues;
  onSave: (values: NoteEditorValues) => Promise<void>;
  onCancel: () => void;
}

// Panel boczny na komputerze, arkusz dolny na telefonie.
export function NoteEditor({ title, initial, onSave, onCancel }: NoteEditorProps) {
  const [topic, setTopic] = useState(initial.topic);
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
    setFormError(null);
    try {
      await onSave({ topic: trimmedTopic });
    } catch (caught) {
      const fieldError = caught instanceof ApiClientError ? caught.fields.topic : undefined;
      if (fieldError) setTopicError(fieldError);
      else setFormError(errorMessage(caught));
      setSaving(false);
    }
  }

  return (
    <aside
      aria-label={title}
      className="fixed inset-x-0 bottom-0 z-20 max-h-[80dvh] overflow-y-auto rounded-t-lg border border-border bg-surface p-4 shadow-lg md:static md:max-h-none md:w-80 md:shrink-0 md:rounded-none md:border-y-0 md:border-r-0 md:shadow-none"
    >
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
        </div>
      </form>
    </aside>
  );
}
