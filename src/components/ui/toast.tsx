"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

const VISIBLE_MS = 5000;

// Krótki komunikat o błędzie reguły lub zapisu; znika sam albo po dotknięciu.
export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (message === null) return;
    const timer = setTimeout(onDismiss, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (message === null) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-30 flex justify-center px-4">
      <button
        type="button"
        role="alert"
        onClick={onDismiss}
        className="pointer-events-auto min-h-11 rounded-md bg-text-primary px-4 py-2 text-left font-medium text-white shadow-lg"
      >
        {message}
      </button>
    </div>
  );
}
