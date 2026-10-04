import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";

// Testy E2E działają na uruchomionym środowisku dev — każdy tworzy własną planszę i po sobie sprząta.
export async function createBoard(request: APIRequestContext, name: string): Promise<string> {
  const response = await request.post("/api/boards", { data: { name: `E2E ${name}` } });
  expect(response.status()).toBe(201);
  return (await response.json()).id;
}

export async function deleteBoard(request: APIRequestContext, boardId: string): Promise<void> {
  await request.delete(`/api/boards/${boardId}`);
}

export async function createNote(
  request: APIRequestContext,
  boardId: string,
  note: { topic: string; x: number; y: number; imageWords?: string; emoji?: string },
): Promise<string> {
  const response = await request.post(`/api/boards/${boardId}/notes`, { data: note });
  expect(response.status()).toBe(201);
  return (await response.json()).id;
}

export function noteNode(page: Page, noteId: string): Locator {
  return page.getByTestId(`rf__node-${noteId}`);
}

// Położenie karteczki w układzie planszy, odczytane z transformacji węzła React Flow.
export async function notePosition(node: Locator): Promise<{ x: number; y: number }> {
  const transform = await node.evaluate((element) => (element as HTMLElement).style.transform);
  const match = transform.match(/translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/);
  if (!match) throw new Error(`Węzeł bez położenia: "${transform}"`);
  return { x: Number(match[1]), y: Number(match[2]) };
}
