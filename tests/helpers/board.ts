import { fireEvent, screen } from "@testing-library/react";

export { NOTE_HEIGHT, NOTE_WIDTH } from "@/components/board/dimensions";

export function getNoteNode(noteId: string): HTMLElement {
  return screen.getByTestId(`rf__node-${noteId}`);
}

// Położenie węzła odczytane z transformacji nadanej przez React Flow.
export function nodePosition(node: HTMLElement): { x: number; y: number } {
  const match = node.style.transform.match(/translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/);
  if (!match) throw new Error(`Węzeł bez położenia: "${node.style.transform}"`);
  return { x: Number(match[1]), y: Number(match[2]) };
}

export function clickPane(container: HTMLElement, x: number, y: number): void {
  const pane = container.querySelector(".react-flow__pane");
  if (!pane) throw new Error("Brak tła planszy");
  fireEvent.click(pane, { clientX: x, clientY: y });
}
