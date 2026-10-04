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
  ["/api/boards/[boardId]", () => import("@/app/api/boards/[boardId]/route")],
  ["/api/boards/[boardId]/export", () => import("@/app/api/boards/[boardId]/export/route")],
  ["/api/boards/[boardId]/notes", () => import("@/app/api/boards/[boardId]/notes/route")],
  ["/api/notes/[noteId]", () => import("@/app/api/notes/[noteId]/route")],
  [
    "/api/boards/[boardId]/connections",
    () => import("@/app/api/boards/[boardId]/connections/route"),
  ],
  ["/api/connections/[connectionId]", () => import("@/app/api/connections/[connectionId]/route")],
  ["/api/boards/[boardId]/zones", () => import("@/app/api/boards/[boardId]/zones/route")],
  ["/api/zones/[zoneId]", () => import("@/app/api/zones/[zoneId]/route")],
  [
    "/api/boards/[boardId]/review-sessions",
    () => import("@/app/api/boards/[boardId]/review-sessions/route"),
  ],
  [
    "/api/review-sessions/[sessionId]/results",
    () => import("@/app/api/review-sessions/[sessionId]/results/route"),
  ],
  [
    "/api/review-sessions/[sessionId]/finish",
    () => import("@/app/api/review-sessions/[sessionId]/finish/route"),
  ],
  ["/api/stats", () => import("@/app/api/stats/route")],
  ["/api/word-images/generate", () => import("@/app/api/word-images/generate/route")],
  ["/api/peg-words", () => import("@/app/api/peg-words/route")],
  ["/api/peg-words/[number]", () => import("@/app/api/peg-words/[number]/route")],
  ["/api/peg-words/[number]/reset", () => import("@/app/api/peg-words/[number]/reset/route")],
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
