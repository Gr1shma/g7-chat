import { test, expect } from "@playwright/test";

test.describe("Chat Page (Guest Mode)", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/auth");
        await page.getByRole("button", { name: /continue as guest/i }).click();
        await page.waitForURL(/\/chat/);
    });

    test("should load chat page and display input", async ({ page }) => {
        await expect(page).toHaveURL(/\/chat/);

        await expect(
            page.getByRole("textbox", { name: /message/i })
        ).toBeVisible();
        await expect(page.locator("textarea")).toBeVisible();
    });

    test("should have disabled send button initially", async ({ page }) => {
        const sendButton = page.getByTestId("send-button");
        await expect(sendButton).toBeDisabled();
    });

    test("should enable send button when text is entered", async ({ page }) => {
        const sendButton = page.getByTestId("send-button");
        const textarea = page.locator("textarea");

        await textarea.fill("Hello world");
        await expect(sendButton).toBeEnabled();

        await textarea.clear();
        await expect(sendButton).toBeDisabled();
    });

    test("should disable send button while sending", async ({ page }) => {
        const sendButton = page.getByTestId("send-button");
        const textarea = page.locator("textarea");

        await page.route("**/api/chat", async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await route.fulfill({ status: 200, body: "Mock response" });
        });

        await textarea.fill("Hello world");
        await expect(sendButton).toBeEnabled();

        await sendButton.click();
        await expect(sendButton).toBeDisabled();
    });
});
