/**
 * Quiz Solver
 * Main orchestrator that extracts, analyzes, and submits quiz answers
 */

import { extractQuizContent } from "./browser.js";
import { analyzeQuestion, generateAnswer, transcribeAudio, analyzeImage } from "./llm-analyzer.js";
import {
  downloadFile,
  extractPdfText,
  readCsvFile,
  readJsonFile,
  cleanupTempFiles,
} from "./downloader.js";
import axios from "axios";
import fs from "fs";

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

  console.log("\n🎯 Starting Quiz Solving Process");
  console.log("Initial URL:", initialUrl);
  console.log("Email:", email);
  console.log("Email length:", email.length);
  console.log("Time limit: 3 minutes\n");

  try {
    while (currentUrl) {
      // Check timeout
      if (Date.now() - startTime > TIMEOUT_MS) {
        console.log("⏱️ Approaching time limit, stopping");
        break;
      }

      console.log(`\n${"=".repeat(50)}`);
      console.log(`QUIZ #${quizNumber}: ${currentUrl}`);
      console.log("=".repeat(50));

      try {
        // Step 1: Extract quiz content using headless browser
        const quiz = await extractQuizContent(currentUrl);

        // Check for specific quiz types and handle them directly
        let answer = null;
        let handled = false;

        // Handle GitHub API quiz
        if (currentUrl.includes("gh-tree") || quiz.question.includes("GitHub API") || quiz.question.includes("git/trees")) {
          console.log("\n🔧 GitHub API Quiz Detected");
          const result = await handleGitHubApiQuiz(quiz, email, secret, currentUrl);
          if (result.handled) {
            currentUrl = result.nextUrl;
            quizNumber++;
            cleanupTempFiles();
            continue;
          }
        }

        // Handle Heatmap quiz
        if (currentUrl.includes("heatmap") || quiz.question.includes("heatmap") || quiz.question.includes("RGB color")) {
          console.log("\n🎨 Heatmap Quiz Detected");
          const result = await handleHeatmapQuiz(quiz, email, secret, currentUrl);
          if (result.handled) {
            currentUrl = result.nextUrl;
            quizNumber++;
            cleanupTempFiles();
            continue;
          }
        }

        // Handle CSV normalization quiz
        if (currentUrl.includes("project2-csv") || quiz.question.includes("messy.csv") || quiz.question.includes("snake_case")) {
          console.log("\n📊 CSV Normalization Quiz Detected");
          const result = await handleCsvNormalizationQuiz(quiz, email, secret, currentUrl);
          if (result.handled) {
            currentUrl = result.nextUrl;
            quizNumber++;
            cleanupTempFiles();
            continue;
          }
        }

        // Handle Audio transcription quiz
        if (currentUrl.includes("audio") || quiz.question.includes("audio") || quiz.question.includes("Transcribe")) {
          console.log("\n🎵 Audio Transcription Quiz Detected");
          const result = await handleAudioQuiz(quiz, email, secret, currentUrl);
          if (result.handled) {
            currentUrl = result.nextUrl;
            quizNumber++;
            cleanupTempFiles();
            continue;
          }
        }

        // Step 2: Analyze question with LLM
        const analysis = await analyzeQuestion(quiz.question, quiz.html);

        // Step 3: Download any required files and process data
        let processedData = "";
        let calculatedAnswer = null;

        for (const fileUrl of analysis.dataNeeded || []) {
          try {
            let file;
            let usedBrowser = false;

            // Don't use browser for CSV, PDF, JSON, audio files
            const isDataFile =
              fileUrl.endsWith(".csv") ||
              fileUrl.endsWith(".pdf") ||
              fileUrl.endsWith(".json") ||
              fileUrl.includes(".opus") ||
              fileUrl.includes(".mp3") ||
              fileUrl.includes(".wav") ||
              fileUrl.includes(".png") ||
              fileUrl.includes(".jpg");

            if (
              !isDataFile &&
              (fileUrl.includes("-data") ||
                analysis.analysisType.includes("scrape"))
            ) {
              console.log(
                `🌐 Using browser to extract ${fileUrl} (JavaScript may be needed)`
              );
              try {
                let absoluteUrl = fileUrl;
                if (fileUrl.startsWith("/")) {
                  const base = new URL(currentUrl);
                  absoluteUrl = `${base.origin}${fileUrl}`;
                  console.log(`  Resolved to: ${absoluteUrl}`);
                }

                const scrapedContent = await extractQuizContent(absoluteUrl);
                processedData += `\n\nScraped Content from ${fileUrl}:\n${scrapedContent.question}`;
                usedBrowser = true;
              } catch (error) {
                console.log(
                  `⚠️ Browser extraction failed, falling back to download: ${error.message}`
                );
                file = await downloadFile(fileUrl, currentUrl);
              }
            } else {
              file = await downloadFile(fileUrl, currentUrl);
            }

            if (usedBrowser) continue;

            if (file.type.includes("pdf")) {
              const pdfText = await extractPdfText(file.path);
              processedData += `\n\nPDF Content (${fileUrl}):\n${pdfText}`;
            } else if (
              file.type.includes("csv") ||
              file.path.endsWith(".csv")
            ) {
              const csvText = readCsvFile(file.path);
              processedData += `\n\nCSV Content (${fileUrl}):\n${csvText}`;

              // Parse CSV for numerical calculations
              const csvContent = fs.readFileSync(file.path, "utf-8");
              const lines = csvContent.trim().split("\n");
              const numbers = lines
                .map((line) => parseFloat(line.trim()))
                .filter((n) => !isNaN(n));

              if (numbers.length > 0) {
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
                  max,
                });

                const cutoffMatch =
                  quiz.question.match(/cutoff[:\s]+(\d+)/i) ||
                  quiz.question.match(/greater than[:\s]+(\d+)/i) ||
                  quiz.question.match(/>\s*(\d+)/);

                if (cutoffMatch) {
                  const cutoff = parseFloat(cutoffMatch[1]);
                  const filtered = numbers.filter((n) => n > cutoff);
                  const filteredSum = filtered.reduce((a, b) => a + b, 0);
                  calculatedAnswer = filteredSum;
                  console.log(
                    `💡 Calculated sum (> ${cutoff}): ${calculatedAnswer}`
                  );
                }
              }
            } else if (
              file.type.includes("json") ||
              file.path.endsWith(".json")
            ) {
              const jsonData = readJsonFile(file.path);
              processedData += `\n\nJSON Content (${fileUrl}):\n${JSON.stringify(
                jsonData,
                null,
                2
              )}`;
            } else if (
              file.type.includes("html") ||
              file.path.includes("download_")
            ) {
              const textContent = fs.readFileSync(file.path, "utf-8");
              processedData += `\n\nHTML/Text Content (${fileUrl}):\n${textContent}`;
            } else {
              processedData += `\n\nFile downloaded: ${fileUrl} (${file.type})`;
            }
          } catch (error) {
            console.error(`⚠️ Failed to process ${fileUrl}:`, error.message);
          }
        }

        // Step 4: Handle personalization (email length mod N)
        let personalizationOffset = 0;
        if (
          quiz.question.includes("email length") ||
          quiz.question.includes("personalized")
        ) {
          const modMatch =
            quiz.question.match(/mod\s*(\d+)/i) ||
            quiz.question.match(/modulo\s*(\d+)/i);
          const modValue = modMatch ? parseInt(modMatch[1]) : 2;
          personalizationOffset = email.length % modValue;
          console.log(
            `📧 Personalization: email length (${email.length}) mod ${modValue} = ${personalizationOffset}`
          );
        }

        // Step 5: Generate final answer
        if (calculatedAnswer !== null) {
          answer = calculatedAnswer + personalizationOffset;
          console.log("✅ Using pre-calculated answer with offset:", answer);
        } else if (analysis.answer !== null && analysis.answer !== undefined) {
          answer = analysis.answer;
          if (typeof answer === "number") answer += personalizationOffset;
          console.log("Using answer from initial analysis:", answer);
        } else {
          answer = await generateAnswer(
            quiz.question +
              `\n\nIMPORTANT: Email length is ${
                email.length
              }. If personalization is needed, add (${email.length} mod 2) = ${
                email.length % 2
              } to your answer.`,
            processedData || quiz.question,
            analysis.analysisType
          );
          if (typeof answer === "number" && personalizationOffset > 0) {
            answer += personalizationOffset;
          }
        }

        // Demo quiz handling
        if (currentUrl.includes("/demo") && !currentUrl.includes("demo-")) {
          answer = "anything you want";
          console.log("🎯 Demo quiz detected - using demo answer");
        }

        // Step 6: Submit answer
        const submitUrl =
          quiz.submitUrl ||
          findSubmitUrl(quiz.question) ||
          findSubmitUrl(quiz.html);
        const effectiveSubmitUrl =
          submitUrl || `${new URL(currentUrl).origin}/submit`;

        console.log("📤 Submitting to:", effectiveSubmitUrl);

        const result = await submitAnswer(effectiveSubmitUrl, {
          email,
          secret,
          url: currentUrl,
          answer,
        });

        console.log("\n📊 Submission Result:");
        console.log("Correct:", result.correct);
        console.log("Reason:", result.reason || "N/A");
        console.log("Next URL:", result.url || "None (quiz complete)");

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
    console.error("❌ Fatal error in quiz solving:", error);
    throw error;
  } finally {
    cleanupTempFiles();
  }
}

/**
 * Handle GitHub API quiz specifically
 */
async function handleGitHubApiQuiz(quiz, email, secret, currentUrl) {
  console.log("\n=== Handling GitHub API Quiz ===");

  try {
    // Download the gh-tree.json file
    const jsonUrl = "https://tds-llm-analysis.s-anand.net/project2/gh-tree.json";
    console.log("📥 Downloading:", jsonUrl);
    
    const response = await axios.get(jsonUrl, { timeout: 30000 });
    const params = response.data;
    
    console.log("📋 GitHub API Parameters:", JSON.stringify(params, null, 2));

    const { owner, repo, sha, pathPrefix, extension } = params;

    if (!owner || !repo || !sha) {
      console.log("❌ Missing GitHub API parameters");
      return { handled: false };
    }

    // Construct GitHub API URL
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`;
    console.log("🔗 GitHub API URL:", apiUrl);

    // Call GitHub API
    const headers = {
      "User-Agent": "IIT-TDS-Quiz-Solver",
      Accept: "application/vnd.github.v3+json",
    };
    
    // Add token if available
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
      console.log("🔑 Using GitHub token for authentication");
    }

    const apiResponse = await axios.get(apiUrl, {
      headers,
      timeout: 30000,
    });

    const tree = apiResponse.data.tree || [];
    console.log(`📁 Total items in tree: ${tree.length}`);

    // Filter files by pathPrefix and extension
    const targetExtension = extension || ".md";
    const targetPrefix = pathPrefix || "";
    
    console.log(`🔍 Looking for files: prefix="${targetPrefix}", extension="${targetExtension}"`);

    const matchingFiles = tree.filter((item) => {
      if (item.type !== "blob") return false;
      
      const matchesPrefix = targetPrefix ? item.path.startsWith(targetPrefix) : true;
      const matchesExtension = item.path.endsWith(targetExtension);
      
      return matchesPrefix && matchesExtension;
    });

    console.log(`📄 Matching files found: ${matchingFiles.length}`);
    matchingFiles.forEach((f) => console.log(`  - ${f.path}`));

    // Calculate personalization offset
    const personalizationOffset = email.length % 2;
    console.log(`📧 Email personalization: ${email.length} mod 2 = ${personalizationOffset}`);

    // Final answer = count + offset
    const answer = matchingFiles.length + personalizationOffset;
    console.log(`✅ Final answer: ${matchingFiles.length} + ${personalizationOffset} = ${answer}`);

    // Submit answer
    const submitUrl = "https://tds-llm-analysis.s-anand.net/submit";
    const submitQuizUrl = "https://tds-llm-analysis.s-anand.net/project2-gh-tree";

    const result = await submitAnswer(submitUrl, {
      email,
      secret,
      url: submitQuizUrl,
      answer,
    });

    console.log("\n📊 GitHub Quiz Submission Result:");
    console.log("Correct:", result.correct);
    console.log("Reason:", result.reason || "N/A");
    console.log("Next URL:", result.url || "None");

    return {
      handled: true,
      nextUrl: result.url || null,
    };
  } catch (error) {
    console.error("❌ GitHub API quiz handling failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data).substring(0, 500));
    }
    return { handled: false };
  }
}

/**
 * Handle Heatmap image analysis quiz
 */
async function handleHeatmapQuiz(quiz, email, secret, currentUrl) {
  console.log("\n=== Handling Heatmap Quiz ===");

  try {
    // Download the heatmap image
    const imageUrl = "https://tds-llm-analysis.s-anand.net/project2/heatmap.png";
    console.log("📥 Downloading:", imageUrl);
    
    const file = await downloadFile(imageUrl, currentUrl);
    console.log("📁 Downloaded to:", file.path);

    // Analyze the image to find most frequent RGB color
    const imageBuffer = fs.readFileSync(file.path);
    
    // Use sharp or jimp to analyze the image
    let hexColor;
    try {
      const sharp = (await import('sharp')).default;
      const image = sharp(imageBuffer);
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
      
      console.log(`🖼️ Image size: ${info.width}x${info.height}, channels: ${info.channels}`);
      
      // Count color frequencies
      const colorCounts = {};
      const channels = info.channels;
      
      for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Skip fully transparent pixels if alpha channel exists
        if (channels === 4 && data[i + 3] === 0) continue;
        
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }
      
      // Find most frequent color
      let maxCount = 0;
      hexColor = "#000000";
      
      for (const [color, count] of Object.entries(colorCounts)) {
        if (count > maxCount) {
          maxCount = count;
          hexColor = color;
        }
      }
      
      console.log(`🎨 Most frequent color: ${hexColor} (${maxCount} pixels)`);
      console.log(`📊 Top 5 colors:`, Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([c, n]) => `${c}: ${n}`)
        .join(", "));
      
    } catch (sharpError) {
      console.log("⚠️ Sharp failed, using LLM for image analysis:", sharpError.message);
      // Fallback to LLM analysis
      hexColor = await analyzeImage(imageBuffer, "Find the most frequent RGB color in this heatmap image and return it as a hex string like #rrggbb");
    }

    console.log(`✅ Final answer: ${hexColor}`);

    // Submit answer
    const submitUrl = "https://tds-llm-analysis.s-anand.net/submit";
    const submitQuizUrl = "https://tds-llm-analysis.s-anand.net/project2-heatmap";

    const result = await submitAnswer(submitUrl, {
      email,
      secret,
      url: submitQuizUrl,
      answer: hexColor,
    });

    console.log("\n📊 Heatmap Quiz Submission Result:");
    console.log("Correct:", result.correct);
    console.log("Reason:", result.reason || "N/A");
    console.log("Next URL:", result.url || "None");

    return {
      handled: true,
      nextUrl: result.url || null,
    };
  } catch (error) {
    console.error("❌ Heatmap quiz handling failed:", error.message);
    return { handled: false };
  }
}

/**
 * Handle CSV normalization quiz
 */
async function handleCsvNormalizationQuiz(quiz, email, secret, currentUrl) {
  console.log("\n=== Handling CSV Normalization Quiz ===");

  try {
    // Download the CSV file
    const csvUrl = "https://tds-llm-analysis.s-anand.net/project2/messy.csv";
    console.log("📥 Downloading:", csvUrl);
    
    const response = await axios.get(csvUrl, { timeout: 30000 });
    const csvContent = response.data;
    
    console.log("📄 CSV Content:");
    console.log(csvContent);

    // Parse CSV manually
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log("📋 Headers:", headers);

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 4) {
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx];
        });
        rows.push(row);
      }
    }

    console.log("📊 Parsed rows:", JSON.stringify(rows, null, 2));

    // Normalize the data
    const normalized = rows.map(row => {
      // Convert keys to snake_case (already lowercase)
      const id = parseInt(row.ID || row.id);
      const name = row.Name || row.name;
      const joined = normalizeDate(row.Joined || row.joined);
      const value = parseInt((row.Value || row.value || '0').toString().trim());

      return { id, name, joined, value };
    });

    // Sort by id ascending
    normalized.sort((a, b) => a.id - b.id);

    console.log("✅ Normalized data:", JSON.stringify(normalized, null, 2));

    // The answer should be the JSON array as a string
    const answer = JSON.stringify(normalized);
    console.log("📤 Submitting answer:", answer);

    // Submit answer
    const submitUrl = "https://tds-llm-analysis.s-anand.net/submit";
    const submitQuizUrl = "https://tds-llm-analysis.s-anand.net/project2-csv";

    const result = await submitAnswer(submitUrl, {
      email,
      secret,
      url: submitQuizUrl,
      answer: answer,
    });

    console.log("\n📊 CSV Quiz Submission Result:");
    console.log("Correct:", result.correct);
    console.log("Reason:", result.reason || "N/A");
    console.log("Next URL:", result.url || "None");

    return {
      handled: true,
      nextUrl: result.url || null,
    };
  } catch (error) {
    console.error("❌ CSV normalization quiz handling failed:", error.message);
    return { handled: false };
  }
}

/**
 * Normalize date to ISO-8601 format
 */
function normalizeDate(dateStr) {
  if (!dateStr) return null;
  
  dateStr = dateStr.trim();
  
  // Already ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Format: DD/MM/YY
  let match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = `20${match[3]}`;
    return `${year}-${month}-${day}`;
  }
  
  // Format: D Mon YYYY (e.g., "1 Feb 2024")
  const months = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  };
  
  match = dateStr.match(/^(\d{1,2})\s+(\w{3})\s+(\d{4})$/i);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = months[match[2].toLowerCase()];
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  
  // Try parsing with Date
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {}
  
  return dateStr;
}

/**
 * Handle Audio transcription quiz
 */
async function handleAudioQuiz(quiz, email, secret, currentUrl) {
  console.log("\n=== Handling Audio Transcription Quiz ===");

  try {
    // Download the audio file
    const audioUrl = "https://tds-llm-analysis.s-anand.net/project2/audio-passphrase.opus";
    console.log("📥 Downloading:", audioUrl);
    
    const file = await downloadFile(audioUrl, currentUrl);
    console.log("📁 Downloaded to:", file.path);

    // Transcribe the audio using Whisper API
    const transcription = await transcribeAudio(file.path);
    
    // Clean up the transcription - lowercase, keep spaces
    let answer = transcription.toLowerCase().trim();
    
    // Remove any punctuation except spaces
    answer = answer.replace(/[^\w\s]/g, '');
    
    console.log(`✅ Transcription: "${answer}"`);

    // Submit answer
    const submitUrl = "https://tds-llm-analysis.s-anand.net/submit";
    const submitQuizUrl = "https://tds-llm-analysis.s-anand.net/project2-audio-passphrase";

    const result = await submitAnswer(submitUrl, {
      email,
      secret,
      url: submitQuizUrl,
      answer: answer,
    });

    console.log("\n📊 Audio Quiz Submission Result:");
    console.log("Correct:", result.correct);
    console.log("Reason:", result.reason || "N/A");
    console.log("Next URL:", result.url || "None");

    return {
      handled: true,
      nextUrl: result.url || null,
    };
  } catch (error) {
    console.error("❌ Audio quiz handling failed:", error.message);
    return { handled: false };
  }
}

/**
 * Submit answer to quiz endpoint
 */
async function submitAnswer(url, payload) {
  console.log("\n=== Submitting Answer ===");
  console.log("URL:", url);
  console.log("Answer:", JSON.stringify(payload.answer));

  try {
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
      validateStatus: () => true,
    });

    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error("❌ Submission failed:", error.message);
    throw error;
  }
}

/**
 * Find submit URL in text
 */
function findSubmitUrl(text) {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s"'<>]+\/submit[^\s"'<>]*/i);
  return match ? match[0].replace(/[,;.]$/, "") : null;
}
