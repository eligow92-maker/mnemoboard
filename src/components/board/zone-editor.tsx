"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { ApiClientError, errorMessage } from "@/lib/api-client";
import { ZONE_NAME_MAX_LENGTH, ZONE_NAME_REQUIRED_MESSAGE } from "@/modules/arrangement/schema";
import { SidePanel } from "./side-panel";

interface ZoneEditorProps {
  title: string;
  initialName: string;
  onSave: (name: string) => Promise<void>;
  onCancel: () => void;
  // Tylko dla istniejącego pokoju.
  onDelete?: () => Promise<void>;
}

export function ZoneEditor({ title, initialName, onSave, onCancel, onDelete }: ZoneEditorProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function run(action: () => Promise<void>): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      const fieldError = caught instanceof ApiClientError ? caught.fields.name : undefined;
      setError(fieldError ?? errorMessage(caught));
      setSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === "") {
      setError(ZONE_NAME_REQUIRED_MESSAGE);
      return;
    }
    await run(() => onSave(trimmed));
  }

  return (
    <SidePanel label={title}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <TextField
          id="zone-name"
          label="Nazwa pokoju"
          value={name}
          maxLength={ZONE_NAME_MAX_LENGTH}
          onChange={(event) => setName(event.target.value)}
          error={error}
          autoFocus
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving}>
            Zapisz
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Anuluj
          </Button>
          {onDelete && (
            <Button
              variant="danger"
              className="ml-auto"
              disabled={saving}
              onClick={() => run(onDelete)}
            >
              Usuń pokój
            </Button>
          )}
        </div>
      </form>
    </SidePanel>
  );
}
