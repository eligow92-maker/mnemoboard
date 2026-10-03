import { createEvent, fireEvent } from "@testing-library/react";

// jsdom nie mierzy elementów — React Flow potrzebuje ResizeObserver, DOMMatrixReadOnly i rozmiarów węzłów.
class ResizeObserverMock {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element): void {
    const contentRect = { x: 0, y: 0, width: 1024, height: 768 } as DOMRectReadOnly;
    this.callback(
      [{ target, contentRect } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }

  unobserve(): void {}

  disconnect(): void {}
}

class DOMMatrixReadOnlyMock {
  m22: number;

  constructor(transform?: string) {
    const scale = transform?.match(/scale\(([\d.]+)\)/)?.[1];
    this.m22 = scale === undefined ? 1 : Number(scale);
  }
}

let installed = false;

export function mockReactFlow(): void {
  if (installed) return;
  installed = true;

  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  globalThis.DOMMatrixReadOnly = DOMMatrixReadOnlyMock as unknown as typeof DOMMatrixReadOnly;

  // Plansza ma rozmiar okna 1024×768, każdy inny element — rozmiar karteczki. React Flow renderuje
  // tylko elementy widoczne w oknie planszy, więc testowe położenia muszą się w nim mieścić.
  const isCanvas = (element: HTMLElement): boolean =>
    element.classList.contains("react-flow") || element.classList.contains("react-flow__renderer");
  Object.defineProperties(globalThis.HTMLElement.prototype, {
    offsetHeight: {
      configurable: true,
      get(this: HTMLElement) {
        return isCanvas(this) ? 768 : 96;
      },
    },
    offsetWidth: {
      configurable: true,
      get(this: HTMLElement) {
        return isCanvas(this) ? 1024 : 180;
      },
    },
  });

  // Bez wymiarów planszy React Flow uznaje, że wskaźnik jest przy krawędzi, i przesuwa widok (autopan).
  globalThis.HTMLElement.prototype.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 1024,
      bottom: 768,
      width: 1024,
      height: 768,
    }) as DOMRect;

  (globalThis.SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () =>
    ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect;
}

// d3-drag nasłuchuje ruchu na `event.view`, a jsdom w Vitest odrzuca `view` w konstruktorze
// zdarzenia — pole dopisujemy więc po utworzeniu zdarzenia.
function mouse(
  type: "mouseDown" | "mouseMove" | "mouseUp",
  target: Element | Document,
  x: number,
  y: number,
): void {
  const event = createEvent[type](target, { clientX: x, clientY: y, button: 0 });
  Object.defineProperty(event, "view", { value: window });
  fireEvent(target, event);
}

type Point = { x: number; y: number };

// React Flow zaczyna liczyć przesunięcie dopiero od pierwszego ruchu ponad próg (1 px).
const THRESHOLD_NUDGE = 2;

// Przeciąga element o wektor `to - from`; bez `to` kończy się na samym kliknięciu.
export function startDrag(element: Element, from: Point, to?: Point): void {
  mouse("mouseDown", element, from.x, from.y);
  if (!to) return;
  mouse("mouseMove", document, from.x + THRESHOLD_NUDGE, from.y);
  mouse("mouseMove", document, to.x + THRESHOLD_NUDGE, to.y);
}

export function endDrag(at: Point): void {
  mouse("mouseUp", document, at.x + THRESHOLD_NUDGE, at.y);
}

export function dragElement(element: Element, from: Point, to: Point): void {
  startDrag(element, from, to);
  endDrag(to);
}
