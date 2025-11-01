/**
 * Quiz Solver
 * Main orchestrator that extracts, analyzes, and submits quiz answers
 */

import { extractQuizContent } from './browser.js';
import { analyzeQuestion, generateAnswer } from './llm-analyzer.js';
import { downloadFile, extractPdfText, readCsvFile, readJsonFile, cleanupTempFiles } from './downloader.js';
import axios from 'axios';

const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 170000; // 2:50 (leave 10s buffer from 3min limit)

/**
 * Main quiz solving function
 * @param {string} email - Student email
 * @param {string} secret - Student secret
 * @param {string} initialUrl - Starting quiz URL
 */
export async function solveQuiz(email, secret, initialUrl) {
  const startTime = Date.now();
  let currentUrl = initialUrl;
  let quizNumber = 1;

  console.log('\n🎯 Starting Quiz Solving Process');
  console.log('Initial URL:', initialUrl);
  console.log('Time limit: 3 minutes\n');

  try {
    while (currentUrl) {
      // Check timeout
      if (Date.now() - startTime > TIMEOUT_MS) {
        console.log('⏱️ Approaching time limit, stopping');
        break;
      }

      console.log(`\n${'='.repeat(50)}`);
      console.log(`QUIZ #${quizNumber}: ${currentUrl}`);
      console.log('='.repeat(50));

      try {
        // Step 1: Extract quiz content using headless browser
        const quiz = await extractQuizContent(currentUrl);

        // Step 2: Analyze question with LLM
        const analysis = await analyzeQuestion(quiz.question, quiz.html);

        // Step 3: Download any required files
        let processedData = '';
        let calculatedAnswer = null; // Store pre-calculated answers

        for (const fileUrl of analysis.dataNeeded || []) {
          try {
            // If it's an HTML page that might need JavaScript, use browser instead of download
            let file;
            let usedBrowser = false;

            // Don't use browser for CSV, PDF, JSON, audio files
            const isDataFile = fileUrl.endsWith('.csv') || fileUrl.endsWith('.pdf') ||
              fileUrl.endsWith('.json') || fileUrl.includes('.opus') ||
              fileUrl.includes('.mp3') || fileUrl.includes('.wav');

            if (!isDataFile && (fileUrl.includes('-data') || analysis.analysisType.includes('scrape'))) {
              // This looks like a page that needs JavaScript execution
              console.log(`🌐 Using browser to extract ${fileUrl} (JavaScript may be needed)`);
              try {
                // Convert relative URL to absolute if needed
                let absoluteUrl = fileUrl;
                if (fileUrl.startsWith('/')) {
                  const base = new URL(currentUrl);
                  absoluteUrl = `${base.origin}${fileUrl}`;
                  console.log(`  Resolved to: ${absoluteUrl}`);
                }

                const scrapedContent = await extractQuizContent(absoluteUrl);
                processedData += `\n\nScraped Content from ${fileUrl}:\n${scrapedContent.question}`;
                usedBrowser = true;
              } catch (error) {
                console.log(`⚠️ Browser extraction failed, falling back to download: ${error.message}`);
                file = await downloadFile(fileUrl, currentUrl);
              }
            } else {
              file = await downloadFile(fileUrl, currentUrl);
            }

            if (usedBrowser) {
              // Already processed above
              continue;
            }

            if (file.type.includes('pdf')) {
              // Extract text from PDF
              const pdfText = await extractPdfText(file.path);
              processedData += `\n\nPDF Content (${fileUrl}):\n${pdfText}`;
            } else if (file.type.includes('csv') || file.path.endsWith('.csv')) {
              const csvText = readCsvFile(file.path);
              processedData += `\n\nCSV Content (${fileUrl}):\n${csvText}`;

              // Try to detect if this is a numerical calculation task
              // Parse CSV and provide statistics
              const fs = await import('fs');
              const csvContent = fs.readFileSync(file.path, 'utf-8');
              const lines = csvContent.trim().split('\n');
              const numbers = lines.map(line => parseFloat(line.trim())).filter(n => !isNaN(n));

              if (numbers.length > 0) {
                // Calculate statistics
                const sum = numbers.reduce((a, b) => a + b, 0);
                const count = numbers.length;
                const avg = sum / count;
                const max = Math.max(...numbers);
                const min = Math.min(...numbers);

                console.log(`📊 CSV Statistics:`, {
                  count,
                  sum,
                  avg: avg.toFixed(2),
                  min,
                  max
                });

                // Check if question mentions a cutoff/threshold
                const cutoffMatch = quiz.question.match(/cutoff[:\s]+(\d+)/i) ||
                  quiz.question.match(/greater than[:\s]+(\d+)/i) ||
                  quiz.question.match(/>\s*(\d+)/);

                if (cutoffMatch) {
                  const cutoff = parseFloat(cutoffMatch[1]);
                  const filtered = numbers.filter(n => n > cutoff);
                  const filteredSum = filtered.reduce((a, b) => a + b, 0);

                  console.log(`🔢 Filtered statistics (> ${cutoff}):`, {
                    count: filtered.length,
                    sum: filteredSum,
                    avg: (filteredSum / filtered.length).toFixed(2)
                  });

                  // Store the calculated answer directly
                  calculatedAnswer = filteredSum;
                  console.log(`💡 Using calculated sum as answer: ${calculatedAnswer}`);

                  processedData += `\n\nCSV Analysis:
- Total numbers: ${count}
- Numbers > ${cutoff}: ${filtered.length}
- Sum of numbers > ${cutoff}: ${filteredSum}
- Sum of all numbers: ${sum}`;
                } else {
                  processedData += `\n\nCSV Analysis:
- Total numbers: ${count}
- Sum: ${sum}
- Average: ${avg.toFixed(2)}
- Range: ${min} to ${max}`;
                }
              }
            } else if (file.type.includes('json') || file.path.endsWith('.json')) {
              const jsonData = readJsonFile(file.path);
              processedData += `\n\nJSON Content (${fileUrl}):\n${JSON.stringify(jsonData, null, 2)}`;
            } else if (file.type.includes('html') || file.path.includes('download_')) {
              // Read HTML/text file
              const fs = await import('fs');
              const textContent = fs.readFileSync(file.path, 'utf-8');
              console.log(`📄 HTML/Text content (${textContent.length} bytes):`, textContent.substring(0, 500));
              processedData += `\n\nHTML/Text Content (${fileUrl}):\n${textContent}`;
            } else {
              processedData += `\n\nFile downloaded: ${fileUrl} (${file.type})`;
            }
          } catch (error) {
            console.error(`⚠️ Failed to process ${fileUrl}:`, error.message);
          }
        }

        // Step 4: Generate final answer
        let answer;
        if (calculatedAnswer !== null) {
          // Use the pre-calculated answer from CSV processing
          answer = calculatedAnswer;
          console.log('✅ Using pre-calculated answer:', answer);
        } else if (analysis.answer !== null && analysis.answer !== undefined) {
          answer = analysis.answer;
          console.log('Using answer from initial analysis:', answer);
        } else {
          answer = await generateAnswer(
            quiz.question,
            processedData || quiz.question,
            analysis.analysisType
          );
        }

        // For demo quiz specifically, use "anything you want" as the answer value
        if (currentUrl.includes('/demo') && !currentUrl.includes('demo-')) {
          // First demo question accepts any answer
          answer = "anything you want";
          console.log('🎯 Demo quiz detected - using demo answer');
        }

        // Step 5: Submit answer
        const submitUrl = quiz.submitUrl || findSubmitUrl(quiz.question) || findSubmitUrl(quiz.html);
        if (!submitUrl) {
          console.error('❌ No submit URL found');
          console.log('Quiz URL:', currentUrl);
          console.log('Question excerpt:', quiz.question.substring(0, 200));
          console.log('Trying to construct submit URL from quiz URL...');

          // Try to construct submit URL from current URL
          const urlObj = new URL(currentUrl);
          const possibleSubmitUrl = `${urlObj.origin}/submit`;
          console.log('Attempting:', possibleSubmitUrl);

          const result = await submitAnswer(possibleSubmitUrl, {
            email,
            secret,
            url: currentUrl,
            answer
          });

          console.log('\n📊 Submission Result:');
          console.log('Correct:', result.correct);
          console.log('Reason:', result.reason || 'N/A');
          console.log('Next URL:', result.url || 'None (quiz complete)');

          currentUrl = result.url || null;
          quizNumber++;
          cleanupTempFiles();
          continue;
        }

        const result = await submitAnswer(submitUrl, {
          email,
          secret,
          url: currentUrl,
          answer
        });

        console.log('\n📊 Submission Result:');
        console.log('Correct:', result.correct);
        console.log('Reason:', result.reason || 'N/A');
        console.log('Next URL:', result.url || 'None (quiz complete)');

        // Move to next quiz if available
        currentUrl = result.url || null;
        quizNumber++;

        // Clean up temp files after each quiz
        cleanupTempFiles();

      } catch (error) {
        console.error(`❌ Error solving quiz #${quizNumber}:`, error.message);

        // Try to continue to next quiz if we have one
        if (error.response && error.response.data && error.response.data.url) {
          currentUrl = error.response.data.url;
          quizNumber++;
        } else {
          break;
        }
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Quiz solving complete!`);
    console.log(`Total time: ${totalTime}s`);
    console.log(`Quizzes attempted: ${quizNumber - 1}`);

  } catch (error) {
    console.error('❌ Fatal error in quiz solving:', error);
    throw error;
  } finally {
    cleanupTempFiles();
  }
}

/**
 * Submit answer to quiz endpoint
 * @param {string} url - Submit URL
 * @param {Object} payload - Submission payload
 * @returns {Promise<Object>}
 */
async function submitAnswer(url, payload) {
  console.log('\n=== Submitting Answer ===');
  console.log('URL:', url);
  console.log('Answer:', JSON.stringify(payload.answer));

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000,
      validateStatus: () => true // Accept any status code
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    return response.data;

  } catch (error) {
    console.error('❌ Submission failed:', error.message);
    throw error;
  }
}

/**
 * Try to find submit URL in question text
 * @param {string} text - Question text
 * @returns {string|null}
 */
function findSubmitUrl(text) {
  const match = text.match(/https?:\/\/[^\s]+\/submit[^\s]*/i);
  return match ? match[0].replace(/[,;.]$/, '') : null;
}
