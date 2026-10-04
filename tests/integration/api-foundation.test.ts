import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { GET as getHealth } from "@/app/api/health/route";
import { ApiError, withApi } from "@/lib/api";

const BASE_URL = "http://localhost:3000";
const NO_PARAMS = { params: Promise.resolve({}) };

function jsonRequest(
  method: string,
  body: string | undefined,
  headers: Record<string, string> = {},
): Request {
  return new Request(`${BASE_URL}/api/echo`, {
    method,
    body,
    headers: { host: "localhost:3000", "content-type": "application/json", ...headers },
  });
}

const echoSchema = z.object({ name: z.string().trim().min(1, "Podaj nazwę") });

function createEchoHandler() {
  const spy = vi.fn();
  const handler = withApi({ body: echoSchema }, async ({ body }) => {
    spy(body);
    return Response.json(body, { status: 201 });
  });
  return { handler, spy };
}

describe("TASK-003 Fundament API", () => {
  it('AC-1: GET /api/health przy działającej bazie zwraca 200 i treść {"status":"ok"}', async () => {
    const response = await getHealth(new Request(`${BASE_URL}/api/health`), NO_PARAMS);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("AC-2: niepoprawny JSON wysłany do endpointu przyjmującego JSON daje 400 z kodem VALIDATION_ERROR", async () => {
    const { handler, spy } = createEchoHandler();

    const response = await handler(jsonRequest("POST", '{"name": '), NO_PARAMS);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("AC-3: żądanie POST z nagłówkiem Origin innej witryny daje 403 z kodem FORBIDDEN_ORIGIN", async () => {
    const { handler, spy } = createEchoHandler();

    const response = await handler(
      jsonRequest("POST", '{"name":"Historia Polski"}', { origin: "http://evil.example" }),
      NO_PARAMS,
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: "FORBIDDEN_ORIGIN" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("przekazuje handlerowi zwalidowaną treść, gdy Origin zgadza się z hostem", async () => {
    const { handler, spy } = createEchoHandler();

    const response = await handler(
      jsonRequest("POST", '{"name":"  Historia Polski "}', { origin: BASE_URL }),
      NO_PARAMS,
    );

    expect(response.status).toBe(201);
    expect(spy).toHaveBeenCalledWith({ name: "Historia Polski" });
  });

  it("zwraca błędy walidacji Zod per pole", async () => {
    const { handler } = createEchoHandler();

    const response = await handler(jsonRequest("POST", '{"name":""}'), NO_PARAMS);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      code: "VALIDATION_ERROR",
      message: expect.any(String),
      fields: { name: "Podaj nazwę" },
    });
  });

  it("odrzuca treść o typie innym niż application/json", async () => {
    const { handler, spy } = createEchoHandler();

    const response = await handler(
      jsonRequest("POST", "name=Historia", { "content-type": "text/plain" }),
      NO_PARAMS,
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("zamienia ApiError rzucony w handlerze na odpowiedź w jednolitym formacie", async () => {
    const handler = withApi({}, async () => {
      throw new ApiError(404, "NOT_FOUND", "Plansza nie istnieje");
    });

    const response = await handler(new Request(`${BASE_URL}/api/boards/x`), NO_PARAMS);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ code: "NOT_FOUND", message: "Plansza nie istnieje" });
  });

  it("nieoczekiwany wyjątek daje 500 bez ujawniania szczegółów", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = withApi({}, async () => {
      throw new Error("sekret z bazy");
    });

    const response = await handler(new Request(`${BASE_URL}/api/boards`), NO_PARAMS);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(body)).not.toContain("sekret");
    consoleError.mockRestore();
  });

  it("przekazuje handlerowi parametry ścieżki", async () => {
    const handler = withApi({}, async ({ params }) => Response.json(params));

    const response = await handler(new Request(`${BASE_URL}/api/boards/abc`), {
      params: Promise.resolve({ boardId: "abc" }),
    });

    expect(await response.json()).toEqual({ boardId: "abc" });
  });
});
