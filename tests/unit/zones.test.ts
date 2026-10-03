import { describe, expect, it } from "vitest";
import { NOTE_HEIGHT, NOTE_WIDTH } from "@/modules/arrangement/note-size";
import { assignZones, zoneForNote, type ZoneArea } from "@/modules/arrangement/zones";

const zone = (id: string, x: number, y: number, createdAt: string, size = 300): ZoneArea => ({
  id,
  x,
  y,
  width: size,
  height: size,
  createdAt: new Date(createdAt),
});

// Karteczka, której środek leży w podanym punkcie.
const noteCenteredAt = (id: string, cx: number, cy: number) => ({
  id,
  x: cx - NOTE_WIDTH / 2,
  y: cy - NOTE_HEIGHT / 2,
});

describe("TASK-014 Geometria stref", () => {
  it("AC-1: dla karteczki, której środek leży wewnątrz strefy, wynikiem jest identyfikator tej strefy", () => {
    const kitchen = zone("kuchnia", 0, 0, "2026-01-01");

    expect(zoneForNote(noteCenteredAt("a", 150, 150), [kitchen])).toBe("kuchnia");
  });

  it("AC-2: dla karteczki w części wspólnej dwóch nakładających się stref wynikiem jest strefa utworzona później", () => {
    const older = zone("starsza", 0, 0, "2026-01-01");
    const newer = zone("nowsza", 200, 200, "2026-02-01");

    expect(zoneForNote(noteCenteredAt("a", 250, 250), [newer, older])).toBe("nowsza");
    expect(zoneForNote(noteCenteredAt("a", 250, 250), [older, newer])).toBe("nowsza");
  });

  it("AC-3: po przesunięciu strefy poza karteczkę przeliczenie przypisań zostawia karteczkę bez strefy", () => {
    const note = noteCenteredAt("a", 150, 150);
    const kitchen = zone("kuchnia", 0, 0, "2026-01-01");
    expect(assignZones([note], [kitchen]).get("a")).toBe("kuchnia");

    const moved = { ...kitchen, x: 1000, y: 1000 };

    expect(assignZones([note], [moved]).get("a")).toBeNull();
  });

  it("liczy środek karteczki, nie jej lewy górny róg", () => {
    const kitchen = zone("kuchnia", 0, 0, "2026-01-01");

    // Róg w strefie, środek poza nią.
    expect(zoneForNote({ id: "a", x: 290, y: 290 }, [kitchen])).toBeNull();
    // Róg poza strefą, środek w niej.
    expect(zoneForNote({ id: "b", x: -80, y: -40 }, [kitchen])).toBe("kuchnia");
  });

  it("zalicza do strefy karteczkę ze środkiem dokładnie na jej krawędzi", () => {
    const kitchen = zone("kuchnia", 0, 0, "2026-01-01");

    expect(zoneForNote(noteCenteredAt("a", 300, 150), [kitchen])).toBe("kuchnia");
    expect(zoneForNote(noteCenteredAt("a", 0, 0), [kitchen])).toBe("kuchnia");
    expect(zoneForNote(noteCenteredAt("a", 300.5, 150), [kitchen])).toBeNull();
  });

  it("po usunięciu nowszej z nakładających się stref karteczka trafia do starszej", () => {
    const note = noteCenteredAt("a", 250, 250);
    const older = zone("starsza", 0, 0, "2026-01-01");
    const newer = zone("nowsza", 200, 200, "2026-02-01");

    expect(assignZones([note], [older, newer]).get("a")).toBe("nowsza");
    expect(assignZones([note], [older]).get("a")).toBe("starsza");
  });

  it("obsługuje strefę o minimalnym rozmiarze i brak stref", () => {
    const tiny = zone("mała", 100, 100, "2026-01-01", 160);

    expect(zoneForNote(noteCenteredAt("a", 180, 180), [tiny])).toBe("mała");
    expect(zoneForNote(noteCenteredAt("a", 180, 180), [])).toBeNull();
  });
});
