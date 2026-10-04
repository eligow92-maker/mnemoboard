import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardEditorScreen } from "@/components/board/board-editor-screen";
import { BoardListScreen } from "@/components/boards/board-list-screen";
import { ReviewScreen } from "@/components/review/review-screen";
import { prisma } from "@/lib/db";
import nextConfig from "../../next.config";
import { apiFetch, installApiFetch } from "../helpers/api-fetch";
import { getNoteNode } from "../helpers/board";
import { resetDb } from "../helpers/db";
import { mockReactFlow } from "../helpers/react-flow";

const SCRIPT = "<script>alert(1)</script>";
const IMG = '<img src=x onerror="alert(2)">';

// Nagłówki, które konfiguracja Next.js dokleja do odpowiedzi dla podanej ścieżki.
async function headersFor(path: string): Promise<Map<string, string>> {
  const rules = (await nextConfig.headers?.()) ?? [];
  const result = new Map<string, string>();
  for (const rule of rules) {
    // Reguły aplikacji używają wyłącznie wzorca obejmującego wszystkie ścieżki.
    if (rule.source !== "/:path*") throw new Error(`Nieobsługiwany wzorzec: ${rule.source}`);
    if (!path.startsWith("/")) continue;
    for (const header of rule.headers) result.set(header.key.toLowerCase(), header.value);
  }
  return result;
}

describe("TASK-022 Utwardzenie bezpieczeństwa", () => {
  let boardId: string;

  beforeAll(() => {
    mockReactFlow();
  });

  beforeEach(async () => {
    await resetDb();
    installApiFetch();
    boardId = (await prisma.board.create({ data: { name: `Plansza ${IMG}` } })).id;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-1: dowolna odpowiedź aplikacji zawiera nagłówki Content-Security-Policy oraz X-Content-Type-Options: nosniff", async () => {
    for (const path of ["/", "/boards/abc/review", "/api/health", "/nie-ma-takiej-strony"]) {
      const headers = await headersFor(path);

      expect(headers.get("content-security-policy")).toContain("default-src 'self'");
      expect(headers.get("x-content-type-options")).toBe("nosniff");
    }
  });

  it("AC-2: zagadnienie <script>alert(1)</script> jest widoczne na planszy jako tekst i nie powstaje element script", async () => {
    const note = await prisma.note.create({ data: { boardId, topic: SCRIPT, x: 100, y: 100 } });

    const { container } = render(<BoardEditorScreen boardId={boardId} />);

    const node = await waitFor(() => getNoteNode(note.id));
    expect(node).toHaveTextContent(SCRIPT);
    expect(container.querySelector("script")).toBeNull();
    expect(document.body.querySelector("script")).toBeNull();
  });

  it("polityka CSP zabrania osadzania w ramkach, obiektów i zasobów z obcych źródeł", async () => {
    const headers = await headersFor("/");
    const csp = headers.get("content-security-policy") ?? "";

    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).not.toMatch(/https?:/);
    expect(headers.get("referrer-policy")).toBe("no-referrer");
    expect(headers.get("x-frame-options")).toBe("DENY");
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("HTML w nazwie planszy, strefy i słowach-obrazach jest renderowany jako tekst", async () => {
    const zone = await prisma.zone.create({
      data: { boardId, name: `Pokój ${IMG}`, x: 0, y: 0, width: 400, height: 400 },
    });
    const note = await prisma.note.create({
      data: { boardId, zoneId: zone.id, topic: "1410", imageWords: `słowa ${IMG}`, x: 50, y: 50 },
    });

    const editor = render(<BoardEditorScreen boardId={boardId} />);
    const node = await waitFor(() => getNoteNode(note.id));
    expect(node).toHaveTextContent(`słowa ${IMG}`);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(`Plansza ${IMG}`);
    expect(screen.getByTestId(`rf__node-${zone.id}`)).toHaveTextContent(`Pokój ${IMG}`);
    expect(editor.container.querySelector("img")).toBeNull();
    editor.unmount();

    const list = render(<BoardListScreen />);
    expect(await screen.findByRole("link", { name: /Plansza <img/ })).toBeInTheDocument();
    expect(list.container.querySelector("img")).toBeNull();
    list.unmount();

    const review = render(<ReviewScreen boardId={boardId} />);
    expect(await screen.findByText("1410")).toBeInTheDocument();
    expect(review.container.querySelector("img")).toBeNull();
  });

  it("API odrzuca pola przekraczające limity długości i zbyt dużą treść żądania", async () => {
    const send = (path: string, method: string, body: unknown) =>
      apiFetch(path, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    const zone = { name: "Kuchnia", x: 0, y: 0, width: 200, height: 200 };

    expect(
      (await send(`/api/boards/${boardId}/zones`, "POST", { ...zone, name: "a".repeat(61) }))
        .status,
    ).toBe(400);
    expect(
      (await send(`/api/boards/${boardId}/zones`, "POST", { ...zone, name: "a".repeat(60) }))
        .status,
    ).toBe(201);
    expect(
      (
        await send(`/api/boards/${boardId}/notes`, "POST", {
          topic: "1410",
          imageWords: "a".repeat(501),
          x: 0,
          y: 0,
        })
      ).status,
    ).toBe(400);
    expect(
      (await send("/api/word-images/generate", "POST", { topic: "1".repeat(501) })).status,
    ).toBe(400);

    const huge = await send("/api/boards", "POST", { name: "Plansza", junk: "x".repeat(200_000) });
    expect(huge.status).toBe(400);
    expect(await huge.json()).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(await prisma.board.count()).toBe(1);
  });
});
