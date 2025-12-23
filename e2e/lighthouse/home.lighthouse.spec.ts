import { test, expect, chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const LIGHTHOUSE_PORT = process.env.LIGHTHOUSE_PORT ?? "9222";
const REPORT_ROOT = process.env.LH_REPORT_ROOT ?? "playwright-report-lighthouse";

interface LighthouseCategory {
  score: number | null;
}

interface LighthouseResult {
  categories: Record<string, LighthouseCategory>;
}

interface LighthouseRunnerResult {
  lhr: LighthouseResult;
  report: string[];
}

function scoreOrZero(category: LighthouseCategory | undefined): number {
  return category?.score ?? 0;
}

async function writeReport(reportDir: string, filename: string, content: string): Promise<void> {
  await fs.writeFile(path.join(reportDir, filename), content);
}

test("home page meets Lighthouse budgets", async ({ baseURL }) => {
  expect(baseURL, "Playwright baseURL must be configured").toBeTruthy();
  const url = new URL("/", baseURL).toString();

  const browser = await chromium.launch({
    args: [`--remote-debugging-port=${LIGHTHOUSE_PORT}`],
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Lighthouse doesn't export clean types
    const { default: lighthouse } = await import("lighthouse");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Lighthouse default export typing is incomplete
    const results = (await lighthouse(url, {
      port: Number(LIGHTHOUSE_PORT),
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      output: ["html", "json"],
      logLevel: "error",
    })) as unknown as LighthouseRunnerResult;

    const { lhr, report } = results;

    const minPerf = Number(process.env.LH_PERF ?? 0.6);
    const minA11y = Number(process.env.LH_A11Y ?? 0.9);
    const minBp = Number(process.env.LH_BP ?? 0.8);
    const minSeo = Number(process.env.LH_SEO ?? 0.8);

    expect(scoreOrZero(lhr.categories.performance)).toBeGreaterThanOrEqual(minPerf);
    expect(scoreOrZero(lhr.categories.accessibility)).toBeGreaterThanOrEqual(minA11y);
    expect(scoreOrZero(lhr.categories["best-practices"])).toBeGreaterThanOrEqual(minBp);
    expect(scoreOrZero(lhr.categories.seo)).toBeGreaterThanOrEqual(minSeo);

    // Write reports into the dedicated Lighthouse report folder so artifacts are easy to find.
    const reportDir = path.resolve(process.cwd(), REPORT_ROOT, "lighthouse");
    await fs.mkdir(reportDir, { recursive: true });

    const [htmlReport, jsonReport] = report;
    await writeReport(reportDir, "home.html", htmlReport);
    await writeReport(reportDir, "home.json", jsonReport);
  } finally {
    await browser.close();
  }
});
