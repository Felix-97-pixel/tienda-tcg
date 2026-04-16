import puppeteer from 'puppeteer';

export async function getCardPriceCK(url: string): Promise<string | null> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Bloqueamos recursos innecesarios para ganar velocidad
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // El selector .stylePrice es el estándar en las fichas de CK
    const price = await page.evaluate(() => {
      const el = document.querySelector('.stylePrice');
      return el ? el.textContent?.trim() : null;
    });

    return price;
  } catch (error) {
    console.error(`Error scrapeando ${url}:`, error);
    return null;
  } finally {
    await browser.close();
  }
}