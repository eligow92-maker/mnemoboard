import { vi } from "vitest";

// Atrapa routera Next.js podstawiana globalnie w tests/setup.ts.
export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
};
