import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/lighthouse",
  // Lighthouse runs are expensive/noisy; keep them isolated and sequential.
  fullyParallel: false,
  workers: 1,
  timeout: 2 * 60 * 1000,

  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["html", { outputFolder: "playwright-report-lighthouse", open: "never" }]],

  use: {
    baseURL: "http://localhost:4173",
    trace: "off",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
