import { test, expect } from "@playwright/test";

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the registration form", async ({ page }) => {
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Last Name")).toBeVisible();
    await expect(page.getByLabel("Phone Number")).toBeVisible();
    await expect(page.getByLabel("Corporation Number")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  });

  test("should show validation errors for empty required fields", async ({ page }) => {
    
    await page.getByLabel("First Name").focus();
    await page.getByLabel("Last Name").focus();
    await page.getByLabel("Phone Number").focus();
    await page.getByLabel("Corporation Number").focus();
    await page.getByRole("button", { name: "Submit" }).focus();

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
});

