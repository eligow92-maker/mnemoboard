import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { BoardCanvas, type CanvasNote } from "@/components/board/board-canvas";
import { endDrag, mockReactFlow, startDrag } from "../helpers/react-flow";

const NOTE: CanvasNote = {
  id: "note-1",
  topic: "1410 – bitwa pod Grunwaldem",
  imageWords: null,
  x: 100,
  y: 50,
};

describe("TASK-004 Prototyp planszy", () => {
  beforeAll(() => {
    mockReactFlow();
  });

  it("AC-1: BoardCanvas dla planszy z jedną karteczką pokazuje węzeł z jej zagadnieniem", () => {
    render(<BoardCanvas notes={[NOTE]} onNoteMove={vi.fn()} />);

    const node = screen.getByTestId("rf__node-note-1");
    expect(node).toHaveTextContent("1410 – bitwa pod Grunwaldem");
  });

  it("AC-2: po zakończeniu przeciągania karteczki BoardCanvas wywołuje onNoteMove z jej identyfikatorem i nowym położeniem", () => {
    const onNoteMove = vi.fn();
    render(<BoardCanvas notes={[NOTE]} onNoteMove={onNoteMove} />);
    const node = screen.getByTestId("rf__node-note-1");

    startDrag(node, { x: 110, y: 60 }, { x: 170, y: 100 });
    expect(onNoteMove).not.toHaveBeenCalled();
    endDrag({ x: 170, y: 100 });

    expect(onNoteMove).toHaveBeenCalledTimes(1);
    expect(onNoteMove).toHaveBeenCalledWith("note-1", { x: 160, y: 90 });
  });

  it("nie zgłasza przesunięcia po samym kliknięciu karteczki", () => {
    const onNoteMove = vi.fn();
    render(<BoardCanvas notes={[NOTE]} onNoteMove={onNoteMove} />);
    const node = screen.getByTestId("rf__node-note-1");

    startDrag(node, { x: 110, y: 60 });
    endDrag({ x: 110, y: 60 });

    expect(onNoteMove).not.toHaveBeenCalled();
  });
});
