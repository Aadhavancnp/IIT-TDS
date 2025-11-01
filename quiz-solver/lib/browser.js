/**
 * Headless Browser Controller
 * Uses Puppeteer to render JavaScript and extract quiz content
 */

import puppeteer from 'puppeteer';

/**
 * Extract quiz content from a URL
 * @param {string} url - The quiz URL to visit
 * @returns {Promise<{question: string, submitUrl: string, html: string}>}
 */
export async function extractQuizContent(url) {
  console.log('\n=== Extracting Quiz Content ===');
  console.log('URL:', url);

  let browser;
  try {
    // Launch headless browser
    // Default to Brave on macOS, can be overridden with PUPPETEER_EXECUTABLE_PATH
    const defaultBravePath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions'
      ],
      // Use Brave by default, or custom path from env
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || defaultBravePath,
      // Increase timeout
      timeout: 60000
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    // Navigate to URL and wait for content
    console.log('Loading page...');
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait a bit for JavaScript to execute
    await page.waitForTimeout(2000);

    // Extract all text content
    const textContent = await page.evaluate(() => {
      return document.body.innerText;
    });

    // Extract HTML content
    const htmlContent = await page.evaluate(() => {
      return document.body.innerHTML;
    });

    // Try to find submit URL in the content
    const submitUrlMatch = textContent.match(/https?:\/\/[^\s]+\/submit[^\s]*/i) ||
                          htmlContent.match(/https?:\/\/[^\s"']+\/submit[^\s"']*/i);
    
    const submitUrl = submitUrlMatch ? submitUrlMatch[0].replace(/[,;.]$/, '') : null;

    console.log('✅ Content extracted');
    console.log('Text length:', textContent.length);
    console.log('Submit URL:', submitUrl);

    return {
      question: textContent,
      submitUrl: submitUrl,
      html: htmlContent,
      url: url
    };

  } catch (error) {
    console.error('❌ Browser extraction failed:', error.message);
    throw new Error(`Failed to extract quiz content: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Take a screenshot of a page (useful for debugging)
 * @param {string} url - The URL to screenshot
 * @param {string} outputPath - Where to save the screenshot
 */
export async function takeScreenshot(url, outputPath) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log('Screenshot saved:', outputPath);
  } finally {
    if (browser) await browser.close();
  }
}
