import { test, expect } from "@playwright/test";

test.describe("authentication page", () => {
    test("displays correct page title", async ({ page }) => {
        await page.goto("/auth");

        await expect(page).toHaveTitle(/g7-chat/i);
    });

    test("displays welcome text and legal links", async ({ page }) => {
        await page.goto("/auth");

        await expect(
            page.getByRole("heading", { name: /welcome to g7 chat/i })
        ).toBeVisible();
        await expect(page.getByText(/sign in below/i)).toBeVisible();
        await expect(
            page.getByText(/by continuing, you agree to/i)
        ).toBeVisible();
    });

    test("displays google sign-in button", async ({ page }) => {
        await page.goto("/auth");

        await expect(
            page.getByRole("button", { name: /continue with google/i })
        ).toBeVisible();
    });

    test("shows gradient background", async ({ page }) => {
        await page.goto("/auth");

        const container = page.getByTestId("auth-page");
        const backgroundImage = await container.evaluate(
            (el) => getComputedStyle(el).backgroundImage
        );

        expect(backgroundImage).toContain("linear-gradient");
    });

    test("has working terms and privacy links", async ({ page }) => {
        await page.goto("/auth");

        const termsLink = page.getByRole("link", { name: /terms of service/i });
        const privacyLink = page.getByRole("link", { name: /privacy policy/i });

        await expect(termsLink).toHaveAttribute("href", "/terms");
        await expect(privacyLink).toHaveAttribute("href", "/privacy");
    });

    test("google button has correct styling", async ({ page }) => {
        await page.goto("/auth");

        const button = page.getByRole("button", {
            name: /continue with google/i,
        });

        const box = await button.boundingBox();
        expect(box?.height).toBeGreaterThan(40);

        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
    });
});
