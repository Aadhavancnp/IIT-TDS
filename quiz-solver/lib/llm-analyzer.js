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
3. Determine what analysis or calculation is required
4. Provide the answer in the exact format requested

Respond in JSON format:
{
  "dataNeeded": ["list of URLs or files mentioned that need to be downloaded"],
  "analysisType": "description of what analysis is needed (e.g., 'sum column', 'filter and count', 'create visualization')",
  "answerFormat": "what format the answer should be in (number, string, boolean, JSON, base64 image, etc.)",
  "reasoning": "step-by-step reasoning about how to solve this",
  "answer": "the actual answer if you can determine it from the context, otherwise null"
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
        answer: null
      };
    }

    console.log('✅ Analysis complete');
    console.log('Data needed:', analysis.dataNeeded);
    console.log('Analysis type:', analysis.analysisType);

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

  const prompt = `You are a data analyst. Answer this quiz question based on the provided data.

QUESTION:
${question}

ANALYSIS REQUIRED:
${analysisType}

DATA:
${data.substring(0, 5000)}

CRITICAL INSTRUCTIONS:
1. Extract the EXACT student email and secret from the question/data
2. Use those EXACT values in your answer, do NOT use placeholders
3. Provide ONLY the answer value itself, not the full JSON payload
4. If the question asks for a number, return only that number
5. If it asks for a string, return only that string
6. If it asks for a calculation result, return only the result
7. Do NOT include the email, secret, or url in your answer - those will be added automatically

Example: If asked "What is 2+2?", respond with: 4
Example: If asked "What is the sum?", respond with: 12345
Example: If asked "What color?", respond with: blue

Provide ONLY the raw answer value, nothing else.`;

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
