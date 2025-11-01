/**
 * Data Downloader
 * Downloads files (PDF, CSV, JSON, images, etc.) from URLs
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

const TEMP_DIR = './temp';

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Download file from URL
 * @param {string} url - URL to download from (can be relative)
 * @param {string} baseUrl - Optional base URL for resolving relative URLs
 * @returns {Promise<{path: string, type: string, content: Buffer}>}
 */
export async function downloadFile(url, baseUrl = null) {
  console.log('\n=== Downloading File ===');
  console.log('URL:', url);

  // Resolve relative URLs
  let absoluteUrl = url;
  if (baseUrl && url.startsWith('/')) {
    const base = new URL(baseUrl);
    absoluteUrl = `${base.origin}${url}`;
    console.log('Resolved to:', absoluteUrl);
  }

  try {
    const response = await axios.get(absoluteUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    const contentType = response.headers['content-type'] || '';
    const ext = getExtensionFromContentType(contentType) || getExtensionFromUrl(url);
    const filename = `download_${Date.now()}${ext}`;
    const filePath = path.join(TEMP_DIR, filename);

    fs.writeFileSync(filePath, response.data);

    console.log('✅ File downloaded');
    console.log('Type:', contentType);
    console.log('Path:', filePath);
    console.log('Size:', response.data.length, 'bytes');

    return {
      path: filePath,
      type: contentType,
      content: response.data
    };

  } catch (error) {
    console.error('❌ Download failed:', error.message);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @param {number} pageNum - Optional specific page number (1-indexed)
 * @returns {Promise<string>}
 */
export async function extractPdfText(filePath, pageNum = null) {
  console.log('\n=== Extracting PDF Text ===');
  console.log('File:', filePath);
  console.log('Page:', pageNum || 'all');

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    console.log('✅ PDF parsed');
    console.log('Pages:', data.numpages);
    console.log('Text length:', data.text.length);

    // If specific page requested, try to extract it
    if (pageNum !== null) {
      // This is approximate - PDF parsing doesn't give perfect page boundaries
      const pages = data.text.split('\f'); // Form feed character often separates pages
      if (pageNum > 0 && pageNum <= pages.length) {
        return pages[pageNum - 1];
      }
    }

    return data.text;

  } catch (error) {
    console.error('❌ PDF extraction failed:', error.message);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
}

/**
 * Read CSV file and return as text
 * @param {string} filePath - Path to CSV file
 * @returns {string}
 */
export function readCsvFile(filePath) {
  console.log('\n=== Reading CSV File ===');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  console.log('✅ CSV read');
  console.log('Total lines:', lines.length);
  console.log('First 3 lines:', lines.slice(0, 3).join('\n'));
  return content;
}

/**
 * Read JSON file and return parsed object
 * @param {string} filePath - Path to JSON file
 * @returns {Object}
 */
export function readJsonFile(filePath) {
  console.log('\n=== Reading JSON File ===');
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  console.log('✅ JSON parsed');
  return data;
}

/**
 * Clean up downloaded files
 */
export function cleanupTempFiles() {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(TEMP_DIR, file));
    }
    console.log('✅ Temp files cleaned up');
  } catch (error) {
    console.error('⚠️ Cleanup warning:', error.message);
  }
}

function getExtensionFromContentType(contentType) {
  const map = {
    'application/pdf': '.pdf',
    'text/csv': '.csv',
    'application/json': '.json',
    'text/plain': '.txt',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
  };

  for (const [type, ext] of Object.entries(map)) {
    if (contentType.includes(type)) return ext;
  }

  return '';
}

function getExtensionFromUrl(url) {
  const match = url.match(/\.(pdf|csv|json|txt|png|jpg|jpeg|xls|xlsx)(\?|$)/i);
  return match ? `.${match[1]}` : '';
}
