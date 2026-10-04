import type { z } from "zod";

type ErrorFields = Record<string, string>;

// Błąd o znanym kodzie — withApi zamienia go na odpowiedź {code, message, fields}.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: ErrorFields,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function notFound(message: string): ApiError {
  return new ApiError(404, "NOT_FOUND", message);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Identyfikator ze ścieżki; zły format to błąd klienta, nie zapytanie do bazy.
export function uuidParam(params: Record<string, string>, name: string): string {
  const value = params[name] ?? "";
  if (!UUID_PATTERN.test(value)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Niepoprawny identyfikator");
  }
  return value;
}

export interface ApiContext<TBody> {
  request: Request;
  params: Record<string, string>;
  body: TBody;
}

// Kształt drugiego argumentu handlera trasy w Next.js (params jest obietnicą).
interface RouteContext {
  params: Promise<Record<string, string>>;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
// Największe poprawne żądanie (karteczka: dwa pola po 500 znaków) jest wielokrotnie mniejsze.
const MAX_BODY_LENGTH = 16_384;

function errorResponse(error: ApiError): Response {
  return Response.json(
    { code: error.code, message: error.message, ...(error.fields && { fields: error.fields }) },
    { status: error.status },
  );
}

// Przeglądarka dołącza Origin do żądań międzywitrynowych; brak nagłówka oznacza klienta spoza przeglądarki.
function assertSameOrigin(request: Request): void {
  if (SAFE_METHODS.has(request.method)) return;

  const origin = request.headers.get("origin");
  if (origin === null) return;

  const host = request.headers.get("host") ?? new URL(request.url).host;
  if (!URL.canParse(origin) || new URL(origin).host !== host) {
    throw new ApiError(403, "FORBIDDEN_ORIGIN", "Żądanie z innej witryny zostało odrzucone");
  }
}

async function parseBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
  optional: boolean,
): Promise<z.infer<TSchema>> {
  const contentType = request.headers.get("content-type") ?? "";
  // Ciało opcjonalne: żądanie bez Content-Type jest poprawne i oznacza brak ciała.
  if (optional && contentType === "") return schema.parse(undefined);
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new ApiError(400, "VALIDATION_ERROR", "Treść żądania musi być w formacie JSON");
  }

  const text = await request.text();
  if (text.length > MAX_BODY_LENGTH) {
    throw new ApiError(400, "VALIDATION_ERROR", "Treść żądania jest zbyt duża");
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ApiError(400, "VALIDATION_ERROR", "Niepoprawny JSON w treści żądania");
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    const fields: ErrorFields = {};
    for (const issue of result.error.issues) {
      fields[issue.path.join(".")] ??= issue.message;
    }
    throw new ApiError(400, "VALIDATION_ERROR", "Niepoprawne dane", fields);
  }
  return result.data;
}

// Wspólna warstwa wszystkich handlerów API (ADR-003) — tu później dojdzie kontrola sesji.
export function withApi<TSchema extends z.ZodTypeAny = z.ZodUndefined>(
  options: { body?: TSchema; bodyOptional?: boolean },
  handler: (context: ApiContext<z.infer<TSchema>>) => Promise<Response>,
): (request: Request, context: RouteContext) => Promise<Response> {
  return async (request, context) => {
    try {
      assertSameOrigin(request);
      const body = options.body
        ? await parseBody(request, options.body, options.bodyOptional ?? false)
        : undefined;
      const params = await context.params;
      return await handler({ request, params, body });
    } catch (error) {
      if (error instanceof ApiError) return errorResponse(error);
      console.error(error);
      return errorResponse(new ApiError(500, "INTERNAL_ERROR", "Wystąpił nieoczekiwany błąd"));
    }
  };
}
