import { vi } from "vitest";

type RouteHandler = (
  request: Request,
  context: { params: Promise<Record<string, string>> },
) => Promise<Response>;
type RouteModule = Partial<Record<string, unknown>>;

// Trasy API dostępne w testach komponentów — wzorzec ścieżki jak w katalogu src/app/api.
const ROUTES: [pattern: string, load: () => Promise<RouteModule>][] = [
  ["/api/health", () => import("@/app/api/health/route")],
  ["/api/boards", () => import("@/app/api/boards/route")],
];

const ORIGIN = "http://localhost:3000";

function matchRoute(pathname: string): { index: number; params: Record<string, string> } | null {
  const segments = pathname.split("/");
  for (const [index, [pattern]] of ROUTES.entries()) {
    const patternSegments = pattern.split("/");
    if (patternSegments.length !== segments.length) continue;
    const params: Record<string, string> = {};
    const matches = patternSegments.every((part, i) => {
      if (part.startsWith("[")) {
        params[part.slice(1, -1)] = decodeURIComponent(segments[i]);
        return true;
      }
      return part === segments[i];
    });
    if (matches) return { index, params };
  }
  return null;
}

// Wywołuje prawdziwy handler trasy tak, jak zrobiłaby to przeglądarka z tej samej witryny.
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = new URL(input, ORIGIN);
  const method = (init.method ?? "GET").toUpperCase();
  const match = matchRoute(url.pathname);
  const handler = match ? ((await ROUTES[match.index][1]())[method] as RouteHandler) : undefined;
  if (!match || !handler) {
    return Response.json({ code: "NOT_FOUND", message: "Brak trasy" }, { status: 404 });
  }

  const headers = new Headers(init.headers);
  headers.set("host", url.host);
  if (method !== "GET") headers.set("origin", ORIGIN);
  const request = new Request(url, { ...init, method, headers });
  return handler(request, { params: Promise.resolve(match.params) });
}

// Podstawia globalny fetch: żądania komponentów trafiają do handlerów API i testowej bazy.
export function installApiFetch(): void {
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) =>
    apiFetch(String(input), init),
  );
}

export async function apiJson<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await apiFetch(path, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} → ${response.status}: ${await response.text()}`);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}
