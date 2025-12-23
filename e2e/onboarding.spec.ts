import { test, expect } from "@playwright/test";

const API_BASE_URL = process.env.VITE_API_BASE_URL ?? "http://localhost:3000";

test.describe("Onboarding Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Step 1: Profile Form", () => {
    test("should display the profile form", async ({ page }) => {
      await expect(page.getByText("Step 1: Profile")).toBeVisible();
      await expect(page.getByLabel("First Name")).toBeVisible();
      await expect(page.getByLabel("Last Name")).toBeVisible();
      await expect(page.getByLabel("Phone Number")).toBeVisible();
      await expect(page.getByLabel("Corporation Number")).toBeVisible();
      await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
    });

    test("should show validation errors for empty required fields", async ({ page }) => {
      await page.getByLabel("First Name").focus();
      await page.getByLabel("Last Name").focus();
      await page.getByLabel("Phone Number").focus();
      await page.getByLabel("Corporation Number").focus();
      await page.getByRole("button", { name: "Continue" }).focus();

      await expect(page.getByText("Required").first()).toBeVisible();
    });

    test("should accept valid input in form fields", async ({ page }) => {
      await page.getByLabel("First Name").fill("John");
      await page.getByLabel("Last Name").fill("Doe");
      await page.getByLabel("Phone Number").fill("+12025551234");
      await page.getByLabel("Corporation Number").fill("123456789");

      await expect(page.getByLabel("First Name")).toHaveValue("John");
      await expect(page.getByLabel("Last Name")).toHaveValue("Doe");
      await expect(page.getByLabel("Phone Number")).toHaveValue("+12025551234");
      await expect(page.getByLabel("Corporation Number")).toHaveValue("123456789");
    });

    test("should only allow numeric input for corporation number", async ({ page }) => {
      await page.getByLabel("Corporation Number").fill("abc123def");

      await expect(page.getByLabel("Corporation Number")).toHaveValue("123");
    });

    test("should show error for invalid phone format", async ({ page }) => {
      await page.getByLabel("Phone Number").fill("1234567890");
      await page.getByLabel("First Name").focus(); // blur the phone field

      await expect(page.getByText("Invalid format")).toBeVisible();
    });

    test("should show error for invalid corporation number length", async ({ page }) => {
      await page.getByLabel("Corporation Number").fill("12345");
      await page.getByLabel("First Name").focus(); // blur the field

      await expect(page.getByText("Must be 9 digits")).toBeVisible();
    });

    test("should display backend error message when submission fails with 400", async ({
      page,
    }) => {
      await page.getByLabel("First Name").fill("John");
      await page.getByLabel("Last Name").fill("Doe");
      await page.getByLabel("Phone Number").fill("+12345678901");
      await page.getByLabel("Corporation Number").fill("826417395");
      await page.getByLabel("First Name").focus(); // blur corporation number to trigger validation

      // Wait for async validation to complete (checkmark appears)
      await expect(page.locator("[data-slot='field-validation-status-valid']")).toBeVisible();

      await page.getByRole("button", { name: "Continue" }).click();

      await expect(
        page.getByRole("alert").filter({ hasText: "Invalid phone number" })
      ).toBeVisible();
    });

    test("should advance to step 2 after successful profile submission", async ({ page }) => {
      await page.getByLabel("First Name").fill("John");
      await page.getByLabel("Last Name").fill("Doe");
      await page.getByLabel("Phone Number").fill("+14376073435");
      await page.getByLabel("Corporation Number").fill("826417395");
      await page.getByLabel("First Name").focus(); // blur corporation number to trigger validation

      await expect(page.locator("[data-slot='field-validation-status-valid']")).toBeVisible();

      await page.getByRole("button", { name: "Continue" }).click();

      // Should advance to step 2
      await expect(page.getByText("Step 2: Business Details")).toBeVisible();
      await expect(page.getByLabel("Business Name")).toBeVisible();
    });

    test("should show validation indicator for corporation number during async validation", async ({
      page,
    }) => {
      await page.route(`${API_BASE_URL}/corporation-number/*`, async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ corporationNumber: "123456789", valid: true }),
        });
      });

      await page.getByLabel("Corporation Number").fill("123456789");
      await page.getByLabel("First Name").focus(); // blur to trigger validation

      await expect(page.locator("[data-slot='field-validation-status-validating']")).toBeVisible();

      await expect(page.locator("[data-slot='field-validation-status-valid']")).toBeVisible({
        timeout: 3000,
      });
    });
  });
});
