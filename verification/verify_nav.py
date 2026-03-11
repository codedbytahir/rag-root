import asyncio
from playwright.async_api import async_playwright, expect

async def verify_frontend():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Verify Landing Page
        await page.goto("http://localhost:3000")
        await asyncio.sleep(5)

        # Screenshot Landing Page
        await page.set_viewport_size({"width": 1280, "height": 3000})
        await page.screenshot(path="/home/jules/verification/landing_page_full.png")

        # Verify Docs Page directly
        await page.goto("http://localhost:3000/dashboard/docs")
        await asyncio.sleep(5)
        await page.screenshot(path="/home/jules/verification/docs_page.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_frontend())
