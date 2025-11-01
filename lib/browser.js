/**
 * Headless Browser Controller
 * Uses Puppeteer to render JavaScript and extract quiz content
 */

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
    // Dynamically load Puppeteer based on environment
    const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
    let puppeteer;
    let launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--single-process',
        '--no-zygote'
      ],
      timeout: 60000
    };

    if (isVercel) {
      // Vercel: Use serverless chromium
      const chromium = (await import('@sparticuz/chromium')).default;
      puppeteer = await import('puppeteer-core');
      launchOptions.args = chromium.args;
      launchOptions.executablePath = await chromium.executablePath();
      console.log('Using serverless Chromium for Vercel');
    } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      // Local: Use custom browser (Brave)
      puppeteer = await import('puppeteer-core');
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      console.log('Using custom browser:', process.env.PUPPETEER_EXECUTABLE_PATH);
    } else {
      // Local: Use bundled Chromium (puppeteer-core)
      puppeteer = await import('puppeteer-core');
      console.log('Using bundled Chromium with puppeteer-core');
    }

    browser = await puppeteer.default.launch(launchOptions);

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

    // Extract specific elements that might contain codes/numbers
    const specificElements = await page.evaluate(() => {
      const elements = {};

      // Check for common ID patterns
      const ids = ['question', 'code', 'secret', 'answer', 'data', 'result'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.textContent.trim()) {
          elements[id] = el.textContent.trim();
        }
      });

      // Get all visible text elements
      const allText = Array.from(document.querySelectorAll('div, span, p, code, pre'))
        .map(el => el.textContent.trim())
        .filter(text => text && text.length > 0 && text.length < 500)
        .slice(0, 10); // First 10 elements

      elements.allVisibleText = allText;

      return elements;
    });

    console.log('✅ Content extracted');
    console.log('Text length:', textContent.length);
    console.log('Text preview:', textContent.substring(0, 300));
    console.log('Specific elements:', JSON.stringify(specificElements, null, 2));

    // Try to find submit URL in the content (multiple patterns)
    let submitUrl = null;

    // Pattern 1: Exact /submit endpoint
    let submitUrlMatch = textContent.match(/https?:\/\/[^\s]+\/submit[^\s]*/i) ||
      htmlContent.match(/https?:\/\/[^\s"']+\/submit[^\s"']*/i);

    if (submitUrlMatch) {
      submitUrl = submitUrlMatch[0].replace(/[,;.]$/, '');
    } else {
      // Pattern 2: Look for form action or data-submit attributes
      const formMatch = htmlContent.match(/(?:action|data-submit)=["']([^"']+)["']/i);
      if (formMatch) {
        submitUrl = formMatch[1];
      } else {
        // Pattern 3: Look for any URL with "submit" in query params or path
        const anySubmitMatch = htmlContent.match(/https?:\/\/[^\s"']+submit[^\s"']*/i);
        if (anySubmitMatch) {
          submitUrl = anySubmitMatch[0].replace(/[,;.]$/, '');
        }
      }
    }

    console.log('Submit URL:', submitUrl || 'NOT FOUND'); return {
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
