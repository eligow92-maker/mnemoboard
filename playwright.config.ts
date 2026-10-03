import { defineConfig, devices } from "@playwright/test";

// Testy z nazwą *mobile.spec.ts działają tylko w profilu mobilnym (375 px, dotyk), pozostałe w desktopowym.
const MOBILE_SPECS = /mobile\.spec\.ts$/;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", testIgnore: MOBILE_SPECS, use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      testMatch: MOBILE_SPECS,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 667 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
});
