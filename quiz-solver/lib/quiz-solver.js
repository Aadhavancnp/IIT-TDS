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
        for (const fileUrl of analysis.dataNeeded || []) {
          try {
            const file = await downloadFile(fileUrl);
            
            if (file.type.includes('pdf')) {
              // Extract text from PDF
              const pdfText = await extractPdfText(file.path);
              processedData += `\n\nPDF Content (${fileUrl}):\n${pdfText}`;
            } else if (file.type.includes('csv') || file.path.endsWith('.csv')) {
              const csvText = readCsvFile(file.path);
              processedData += `\n\nCSV Content (${fileUrl}):\n${csvText}`;
            } else if (file.type.includes('json') || file.path.endsWith('.json')) {
              const jsonData = readJsonFile(file.path);
              processedData += `\n\nJSON Content (${fileUrl}):\n${JSON.stringify(jsonData, null, 2)}`;
            } else {
              processedData += `\n\nFile downloaded: ${fileUrl} (${file.type})`;
            }
          } catch (error) {
            console.error(`⚠️ Failed to process ${fileUrl}:`, error.message);
          }
        }

        // Step 4: Generate final answer
        let answer;
        if (analysis.answer !== null && analysis.answer !== undefined) {
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
        // The demo quiz expects: { email, secret, url, answer: "anything you want" }
        if (currentUrl.includes('demo') && typeof answer === 'string' && answer.toLowerCase().includes('anything')) {
          answer = "anything you want";
        }

        // Step 5: Submit answer
        const submitUrl = quiz.submitUrl || findSubmitUrl(quiz.question);
        if (!submitUrl) {
          console.error('❌ No submit URL found');
          break;
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
