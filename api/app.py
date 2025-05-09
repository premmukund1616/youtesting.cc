import asyncio
import nest_asyncio
from fastapi import FastAPI
from pyppeteer import launch

# Apply nest_asyncio to allow async in non-main threads
nest_asyncio.apply()

app = FastAPI()

# Function to open YouTube redirect and click the button
async def click_go_button(yt_redirect_url: str) -> str:
    try:
        browser = await launch(headless=True, args=["--no-sandbox", "--disable-setuid-sandbox"])
        page = await browser.newPage()
        await page.goto(yt_redirect_url)

        # Click "Go to site" button (wait up to 5s)
        try:
            await page.click('text="Go to site"', timeout=5000)
            await page.waitForNavigation()
            final_url = page.url
        except Exception as e:
            final_url = f"Failed to click: {str(e)}"
        
        await browser.close()
        return final_url

    except Exception as e:
        return f"Error: {str(e)}"

@app.get("/")
async def open_and_click(yt_redirect_url: str):
    result = await click_go_button(yt_redirect_url)
    return {"final_url": result}
