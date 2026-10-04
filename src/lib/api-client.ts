// Klient API dla komponentów: JSON w obie strony, błędy w formacie {code, message, fields}.

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const NETWORK_ERROR_MESSAGE = "Brak połączenia z serwerem. Spróbuj ponownie.";

export async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  return send<T>(path, method, body === undefined ? undefined : JSON.stringify(body));
}

// Wysyła gotową treść JSON (np. wczytany plik) bez ponownego serializowania.
export async function apiJsonText<T>(path: string, method: string, text: string): Promise<T> {
  return send<T>(path, method, text);
}

async function send<T>(path: string, method: string, body: string | undefined): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body,
    });
  } catch {
    throw new ApiClientError(0, "NETWORK_ERROR", NETWORK_ERROR_MESSAGE);
  }

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = (payload ?? {}) as {
      code?: string;
      message?: string;
      fields?: Record<string, string>;
    };
    throw new ApiClientError(
      response.status,
      error.code ?? "UNKNOWN_ERROR",
      error.message ?? "Wystąpił nieoczekiwany błąd",
      error.fields,
    );
  }
  return payload as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiClientError ? error.message : "Wystąpił nieoczekiwany błąd";
}
