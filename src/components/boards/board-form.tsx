"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { ApiClientError, errorMessage } from "@/lib/api-client";
import { BOARD_NAME_MAX_LENGTH, BOARD_NAME_REQUIRED_MESSAGE } from "@/modules/boards/schema";

interface BoardFormProps {
  initialName?: string;
  submitLabel: string;
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
}

export function BoardForm({ initialName = "", submitLabel, onSubmit, onCancel }: BoardFormProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === "") {
      setError(BOARD_NAME_REQUIRED_MESSAGE);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit(trimmed);
    } catch (caught) {
      const fieldError = caught instanceof ApiClientError ? caught.fields.name : undefined;
      setError(fieldError ?? errorMessage(caught));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <TextField
        id="board-name"
        label="Nazwa planszy"
        value={name}
        maxLength={BOARD_NAME_MAX_LENGTH}
        onChange={(event) => setName(event.target.value)}
        error={error}
        autoFocus
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {submitLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}
