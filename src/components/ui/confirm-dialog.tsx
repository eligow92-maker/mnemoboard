"use client";

import { useId, type ReactNode } from "react";
import { Button } from "./button";

interface ConfirmDialogProps {
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex w-full max-w-sm flex-col gap-3 rounded-lg bg-surface p-4 shadow-lg"
      >
        <h2 id={titleId} className="text-lg font-bold">
          {title}
        </h2>
        {children && <div className="break-words text-text-secondary">{children}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Anuluj
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
