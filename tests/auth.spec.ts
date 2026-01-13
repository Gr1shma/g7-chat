import { test, expect } from "@playwright/test";

test.describe("Authentication Page UI", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/auth");
    });

    test("should display the correct page title", async ({ page }) => {
        await expect(page).toHaveTitle(/g7-chat/i);
    });

    test("should display welcome heading and sign-in prompt", async ({ page }) => {
        await expect(
            page.getByRole("heading", { name: "Welcome to G7 Chat" })
        ).toBeVisible();
        await expect(page.getByText(/sign in below/i)).toBeVisible();
    });

    test("should render the Google sign-in button", async ({ page }) => {
        await expect(
            page.getByRole("button", { name: /continue with google/i })
        ).toBeVisible();
    });

    test("should have functional Terms and Privacy links", async ({ page }) => {
        const termsLink = page.getByRole("link", { name: /terms of service/i });
        const privacyLink = page.getByRole("link", { name: /privacy policy/i });

        await expect(termsLink).toBeVisible();
        await expect(privacyLink).toBeVisible();

        // Verify they lead to the correct routes
        await expect(termsLink).toHaveAttribute("href", "/terms");
        await expect(privacyLink).toHaveAttribute("href", "/privacy");
    });

    test("should display the background gradient", async ({ page }) => {
        // The container is the main div with the gradient
        const container = page.locator(".bg-gradient-to-br").first();
        const backgroundImage = await container.evaluate(
            (el) => getComputedStyle(el).backgroundImage
        );

        expect(backgroundImage).toContain("linear-gradient");
    });
});

test.describe("Authentication Redirects (Unauthenticated)", () => {
    test("should redirect to auth page when accessing root /", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveURL(/\/auth/);
    });

    test("should redirect to auth page when accessing /setting", async ({ page }) => {
        await page.goto("/setting");
        await expect(page).toHaveURL(/\/auth/);
    });

    test("should redirect to auth page when accessing /chat", async ({ page }) => {
        await page.goto("/chat");
        await expect(page).toHaveURL(/\/auth/);
    });
});
