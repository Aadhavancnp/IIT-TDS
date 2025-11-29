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
  console.log('Email:', email);
  console.log('Email length:', email.length);
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

        // Step 3: Download any required files and process data
        let processedData = '';
        let calculatedAnswer = null;
        let apiParams = null; // Store API parameters from JSON files

        for (const fileUrl of analysis.dataNeeded || []) {
          try {
            let file;
            let usedBrowser = false;

            // Don't use browser for CSV, PDF, JSON, audio files
            const isDataFile = fileUrl.endsWith('.csv') || fileUrl.endsWith('.pdf') ||
              fileUrl.endsWith('.json') || fileUrl.includes('.opus') ||
              fileUrl.includes('.mp3') || fileUrl.includes('.wav');

            if (!isDataFile && (fileUrl.includes('-data') || analysis.analysisType.includes('scrape'))) {
              console.log(`🌐 Using browser to extract ${fileUrl} (JavaScript may be needed)`);
              try {
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

            if (usedBrowser) continue;

            if (file.type.includes('pdf')) {
              const pdfText = await extractPdfText(file.path);
              processedData += `\n\nPDF Content (${fileUrl}):\n${pdfText}`;
            } else if (file.type.includes('csv') || file.path.endsWith('.csv')) {
              const csvText = readCsvFile(file.path);
              processedData += `\n\nCSV Content (${fileUrl}):\n${csvText}`;

              // Parse CSV for numerical calculations
              const fs = await import('fs');
              const csvContent = fs.readFileSync(file.path, 'utf-8');
              const lines = csvContent.trim().split('\n');
              const numbers = lines.map(line => parseFloat(line.trim())).filter(n => !isNaN(n));

              if (numbers.length > 0) {
                const sum = numbers.reduce((a, b) => a + b, 0);
                const count = numbers.length;
                const avg = sum / count;
                const max = Math.max(...numbers);
                const min = Math.min(...numbers);

                console.log(`📊 CSV Statistics:`, { count, sum, avg: avg.toFixed(2), min, max });

                const cutoffMatch = quiz.question.match(/cutoff[:\s]+(\d+)/i) ||
                  quiz.question.match(/greater than[:\s]+(\d+)/i) ||
                  quiz.question.match(/>\s*(\d+)/);

                if (cutoffMatch) {
                  const cutoff = parseFloat(cutoffMatch[1]);
                  const filtered = numbers.filter(n => n > cutoff);
                  const filteredSum = filtered.reduce((a, b) => a + b, 0);
                  calculatedAnswer = filteredSum;
                  console.log(`💡 Calculated sum (> ${cutoff}): ${calculatedAnswer}`);
                }
              }
            } else if (file.type.includes('json') || file.path.endsWith('.json')) {
              const jsonData = readJsonFile(file.path);
              processedData += `\n\nJSON Content (${fileUrl}):\n${JSON.stringify(jsonData, null, 2)}`;
              
              // Store API parameters if this looks like a config file
              if (jsonData.owner || jsonData.repo || jsonData.sha || jsonData.pathPrefix) {
                apiParams = jsonData;
                console.log('📋 Found API parameters:', apiParams);
              }
            } else if (file.type.includes('html') || file.path.includes('download_')) {
              const fs = await import('fs');
              const textContent = fs.readFileSync(file.path, 'utf-8');
              processedData += `\n\nHTML/Text Content (${fileUrl}):\n${textContent}`;
            } else {
              processedData += `\n\nFile downloaded: ${fileUrl} (${file.type})`;
            }
          } catch (error) {
            console.error(`⚠️ Failed to process ${fileUrl}:`, error.message);
          }
        }

        // Step 4: Handle GitHub API quiz specifically
        if (quiz.question.includes('GitHub API') || quiz.question.includes('git/trees') || 
            quiz.question.includes('/repos/{owner}') || currentUrl.includes('gh-tree')) {
          console.log('\n🔧 GitHub API Quiz Detected');
          const result = await handleGitHubApiQuiz(quiz, email, secret, currentUrl, apiParams, processedData);
          if (result.handled) {
            currentUrl = result.nextUrl;
            quizNumber++;
            cleanupTempFiles();
            continue;
          }
        }

        // Step 5: Handle personalization (email length mod N)
        let personalizationOffset = 0;
        if (quiz.question.includes('email length') || quiz.question.includes('personalized')) {
          const modMatch = quiz.question.match(/mod\s*(\d+)/i) || quiz.question.match(/modulo\s*(\d+)/i);
          const modValue = modMatch ? parseInt(modMatch[1]) : 2;
          personalizationOffset = email.length % modValue;
          console.log(`📧 Personalization: email length (${email.length}) mod ${modValue} = ${personalizationOffset}`);
        }

        // Step 6: Generate final answer
        let answer;
        if (calculatedAnswer !== null) {
          answer = calculatedAnswer + personalizationOffset;
          console.log('✅ Using pre-calculated answer with offset:', answer);
        } else if (analysis.answer !== null && analysis.answer !== undefined) {
          answer = analysis.answer;
          if (typeof answer === 'number') answer += personalizationOffset;
          console.log('Using answer from initial analysis:', answer);
        } else {
          answer = await generateAnswer(
            quiz.question + `\n\nIMPORTANT: Email length is ${email.length}. If personalization is needed, add (${email.length} mod 2) = ${email.length % 2} to your answer.`,
            processedData || quiz.question,
            analysis.analysisType
          );
          if (typeof answer === 'number' && personalizationOffset > 0) {
            answer += personalizationOffset;
          }
        }

        // Demo quiz handling
        if (currentUrl.includes('/demo') && !currentUrl.includes('demo-')) {
          answer = "anything you want";
          console.log('🎯 Demo quiz detected - using demo answer');
        }

        // Step 7: Submit answer
        const submitUrl = quiz.submitUrl || findSubmitUrl(quiz.question) || findSubmitUrl(quiz.html);
        const effectiveSubmitUrl = submitUrl || `${new URL(currentUrl).origin}/submit`;
        
        console.log('📤 Submitting to:', effectiveSubmitUrl);

        const result = await submitAnswer(effectiveSubmitUrl, {
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

      } catch (error) {
        console.error(`❌ Error solving quiz #${quizNumber}:`, error.message);
        if (error.response?.data?.url) {
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
 * Handle GitHub API quiz specifically
 */
async function handleGitHubApiQuiz(quiz, email, secret, currentUrl, apiParams, processedData) {
  console.log('\n=== Handling GitHub API Quiz ===');
  
  try {
    // Extract parameters from question or JSON
    let owner, repo, sha, pathPrefix, extension;
    
    if (apiParams) {
      owner = apiParams.owner;
      repo = apiParams.repo;
      sha = apiParams.sha;
      pathPrefix = apiParams.pathPrefix || '';
      extension = apiParams.extension || '.md';
    } else {
      // Try to extract from processed data or question
      const jsonMatch = processedData.match(/\{[^}]*"owner"[^}]*\}/s);
      if (jsonMatch) {
        try {
          const params = JSON.parse(jsonMatch[0]);
          owner = params.owner;
          repo = params.repo;
          sha = params.sha;
          pathPrefix = params.pathPrefix || '';
          extension = params.extension || '.md';
        } catch (e) {
          console.log('Could not parse JSON params from data');
        }
      }
    }

    if (!owner || !repo || !sha) {
      console.log('❌ Missing GitHub API parameters');
      return { handled: false };
    }

    // Construct GitHub API URL
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`;
    console.log('🔗 GitHub API URL:', apiUrl);

    // Call GitHub API
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'IIT-TDS-Quiz-Solver',
        'Accept': 'application/vnd.github.v3+json'
      },
      timeout: 30000
    });

    const tree = response.data.tree || [];
    console.log(`📁 Total files in tree: ${tree.length}`);

    // Filter files by pathPrefix and extension
    const matchingFiles = tree.filter(item => {
      const matchesPrefix = !pathPrefix || item.path.startsWith(pathPrefix);
      const matchesExtension = !extension || item.path.endsWith(extension);
      return item.type === 'blob' && matchesPrefix && matchesExtension;
    });

    console.log(`📄 Files matching ${pathPrefix}*${extension}: ${matchingFiles.length}`);
    matchingFiles.forEach(f => console.log(`  - ${f.path}`));

    // Calculate personalization offset
    const personalizationOffset = email.length % 2;
    console.log(`📧 Email personalization: ${email.length} mod 2 = ${personalizationOffset}`);

    // Final answer = count + offset
    const answer = matchingFiles.length + personalizationOffset;
    console.log(`✅ Final answer: ${matchingFiles.length} + ${personalizationOffset} = ${answer}`);

    // Find submit URL
    const submitUrl = quiz.submitUrl || findSubmitUrl(quiz.question) || `${new URL(currentUrl).origin}/submit`;
    
    // Determine the correct URL to submit (might be different from currentUrl)
    let submitQuizUrl = currentUrl;
    if (quiz.question.includes('project2-gh-tree')) {
      submitQuizUrl = `${new URL(currentUrl).origin}/project2-gh-tree`;
    }

    // Submit answer
    const result = await submitAnswer(submitUrl, {
      email,
      secret,
      url: submitQuizUrl,
      answer
    });

    console.log('\n📊 GitHub Quiz Submission Result:');
    console.log('Correct:', result.correct);
    console.log('Reason:', result.reason || 'N/A');
    console.log('Next URL:', result.url || 'None');

    return {
      handled: true,
      nextUrl: result.url || null
    };

  } catch (error) {
    console.error('❌ GitHub API quiz handling failed:', error.message);
    return { handled: false };
  }
}

/**
 * Submit answer to quiz endpoint
 */
async function submitAnswer(url, payload) {
  console.log('\n=== Submitting Answer ===');
  console.log('URL:', url);
  console.log('Answer:', JSON.stringify(payload.answer));

  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
      validateStatus: () => true
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
 * Find submit URL in text
 */
function findSubmitUrl(text) {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s"'<>]+\/submit[^\s"'<>]*/i);
  return match ? match[0].replace(/[,;.]$/, '') : null;
}
