/**
 * LLM Analyzer
 * Uses AI Pipe to analyze quiz questions and generate answers
 */

const AIPIPE_TOKEN = process.env.AIPIPE_TOKEN;
const AIPIPE_URL = 'https://aipipe.org/openrouter/v1/chat/completions';

/**
 * Analyze quiz question and generate answer using LLM
 * @param {string} question - The quiz question text
 * @param {string} context - Additional context (HTML, downloaded files, etc.)
 * @returns {Promise<{answer: any, reasoning: string, dataNeeded: string[]}>}
 */
export async function analyzeQuestion(question, context = '') {
  console.log('\n=== Analyzing Question with LLM ===');

  const prompt = `You are a data analysis expert helping solve a quiz question.

QUIZ QUESTION:
${question}

${context ? `ADDITIONAL CONTEXT:\n${context.substring(0, 2000)}` : ''}

INSTRUCTIONS:
1. Carefully read the question and understand what is being asked
2. Identify what data you need (files to download, APIs to call, etc.)
3. Look for URLs mentioned in the question (including relative URLs like "/demo-scrape-data")
4. Determine what analysis or calculation is required
5. Provide the answer in the exact format requested

IMPORTANT: 
- Include ALL URLs mentioned in the question text in the "dataNeeded" array
- If you see relative URLs (starting with /), include them in dataNeeded
- Pay attention to keywords: "scrape", "GET", "download", "fetch", "data from"
- Look for JSON parameter files (like /project2/gh-tree.json) - include these!
- If you see GitHub API patterns like /repos/{owner}/{repo}/git/trees/{sha}, note this is a template

Respond in JSON format:
{
  "dataNeeded": ["list of ALL URLs or files mentioned that need to be downloaded/scraped, including relative paths and JSON config files"],
  "analysisType": "description of what analysis is needed (e.g., 'sum column', 'scrape secret code', 'count items', 'github api call')",
  "answerFormat": "what format the answer should be in (number, string, boolean, JSON, base64 image, etc.)",
  "reasoning": "step-by-step reasoning about how to solve this",
  "answer": "the actual answer if you can determine it from the context, otherwise null",
  "isGitHubApi": true/false if this involves GitHub API,
  "needsPersonalization": true/false if answer needs email-based offset
}`;

  try {
    const response = await fetch(AIPIPE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIPIPE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI Pipe error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Try to parse JSON response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n(.*?)\n```/s) || content.match(/```\n(.*?)\n```/s);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      // If not JSON, create structured response
      analysis = {
        dataNeeded: [],
        analysisType: 'unknown',
        answerFormat: 'string',
        reasoning: content,
        answer: null,
        isGitHubApi: false,
        needsPersonalization: false
      };
    }

    console.log('✅ Analysis complete');
    console.log('Data needed:', analysis.dataNeeded);
    console.log('Analysis type:', analysis.analysisType);
    console.log('Is GitHub API:', analysis.isGitHubApi || false);
    console.log('Needs personalization:', analysis.needsPersonalization || false);

    return analysis;

  } catch (error) {
    console.error('❌ LLM analysis failed:', error.message);
    throw error;
  }
}

/**
 * Process data and generate final answer using LLM
 * @param {string} question - Original question
 * @param {string} data - Downloaded/processed data
 * @param {string} analysisType - Type of analysis needed
 * @returns {Promise<any>} - The final answer
 */
export async function generateAnswer(question, data, analysisType) {
  console.log('\n=== Generating Final Answer ===');

  const prompt = `You are a precise data analyst. Extract information and calculate answers from data.

QUESTION:
${question}

TASK TYPE:
${analysisType}

RAW DATA:
${data.substring(0, 8000)}

INSTRUCTIONS:
1. Look at the QUESTION - identify if it asks for: sum, count, average, extract value, etc.
2. Look at the RAW DATA - find the numbers or values you need
3. Calculate or extract the answer
4. Return ONLY the final answer value

IMPORTANT RULES:
- If question says "sum" → ADD all matching numbers together
- If question says "count" or "how many" → COUNT matching items
- If question says "extract secret/code" → Find and return that exact value
- If data has a cutoff/threshold → filter FIRST, then calculate
- If question mentions "email length" or "personalized" → Check if you need to add an offset
- Return ONLY the answer (number, string, code) - NO explanations
- Do NOT refuse, do NOT say "I cannot" - just calculate and return the value

EXAMPLES:
Question: "Sum of values > 100"
Data: "150\n200\n50\n300"
Answer: 650

Question: "Get the secret code"
Data: "The secret code is: ABC123"
Answer: ABC123

Question: "How many items exceed 1000"
Data: "1200\n800\n1500\n900"
Answer: 2

Question: "Count .md files, then add (email length mod 2). Email length is 33."
Data: "Found 5 .md files"
Answer: 6

Now solve this and return ONLY the answer value:`;

  try {
    const response = await fetch(AIPIPE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIPIPE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`AI Pipe error: ${response.status}`);
    }

    const result = await response.json();
    let answer = result.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    answer = answer.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Try to parse as JSON if it looks like JSON
    if (answer.startsWith('{') || answer.startsWith('[')) {
      try {
        answer = JSON.parse(answer);
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }

    // Try to parse as number if it looks like a number
    if (typeof answer === 'string' && /^-?\d+\.?\d*$/.test(answer)) {
      answer = parseFloat(answer);
    }

    // Try to parse as boolean
    if (answer === 'true') answer = true;
    if (answer === 'false') answer = false;

    console.log('✅ Answer generated:', answer);
    return answer;

  } catch (error) {
    console.error('❌ Answer generation failed:', error.message);
    throw error;
  }
}
