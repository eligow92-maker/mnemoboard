import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { AppShell } from "@/components/app-shell";

describe("TASK-001 Szkielet projektu", () => {
  it('AC-1: strona główna pokazuje nagłówek "Mnemoboard" z linkami "Plansze" i "Lista GSP"', () => {
    render(
      <AppShell>
        <Home />
      </AppShell>,
    );

    const header = screen.getByRole("banner");
    expect(header).toHaveTextContent("Mnemoboard");
    expect(screen.getByRole("link", { name: "Plansze" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Lista GSP" })).toHaveAttribute("href", "/peg-words");
  });

  it("AC-2: tsconfig.json ma włączony tryb strict", () => {
    const tsconfig = JSON.parse(readFileSync(path.resolve(process.cwd(), "tsconfig.json"), "utf8"));

    expect(tsconfig.compilerOptions.strict).toBe(true);
  });
});
