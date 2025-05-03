import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // UTM-enabled website URL
    const websiteURL = "https://your-website.com/?utm_source=youtube&utm_medium=referral&utm_campaign=video_click";
    const redirectURL = "https://www.youtube.com/redirect?q=" + encodeURIComponent(websiteURL);

    await page.goto(redirectURL, { waitUntil: 'networkidle2' });

    const goSiteSelector = 'a[href*="your-website.com"]';

    await page.waitForSelector(goSiteSelector, { timeout: 5000 });
    await page.waitForTimeout(2000); // Wait 2 seconds
    await page.click(goSiteSelector);

    await page.waitForNavigation({ waitUntil: 'load', timeout: 10000 });

    const finalUrl = page.url();

    res.status(200).json({ redirectedTo: finalUrl });

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (browser !== null) await browser.close();
  }
}
