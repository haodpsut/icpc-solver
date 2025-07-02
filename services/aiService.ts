import { GoogleGenAI } from "@google/genai";
import { AIProvider, ApiKeys } from '../types';

export const createAnalysisPrompt = (problemText: string): string => `
Analyze the following competitive programming problem. Provide a clear and concise explanation of:
1. The core task or objective.
2. The input format.
3. The output format.
4. The constraints on the input values.
5. A step-by-step breakdown of the logic from one of the provided example test cases, explaining how the output is derived from the input.

Do not write any code. Focus only on the explanation. Respond in plain text.

Problem Statement:
---
${problemText}
---
`;

export const createCodePrompt = (problemText: string, analysis: string): string => `
Based on the following competitive programming problem and its analysis, write a complete, correct, and efficient C++ solution.
The solution should be well-commented and follow best practices for competitive programming.
The code should be enclosed in a single C++ markdown block.

Problem Statement:
---
${problemText}
---

Analysis:
---
${analysis}
---
`;

export const createChatPrompt = (problemText: string, analysis: string, code: string, userQuestion: string): string => `
You are a helpful AI assistant and an expert in competitive programming.
Your task is to answer a user's question based *only* on the provided problem description, its analysis, and the generated C++ solution.
Do not go beyond this context. Keep your answer clear, concise, and directly related to the provided information.

Here is the full context you have available:

### Problem Statement ###
${problemText}

### Problem Analysis ###
${analysis}

### Generated C++ Solution ###
${code || "Not generated yet."}

---

Based on all the information above, please provide an answer to the following question.

**User Question:** "${userQuestion}"
`;


export const callAI = async (
    prompt: string, 
    provider: AIProvider, 
    model: string, 
    apiKeys: ApiKeys
): Promise<string> => {
    if (provider === AIProvider.Gemini) {
        if (!apiKeys.gemini) throw new Error("Gemini API key is missing.");
        
        try {
            const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-04-17',
                contents: prompt,
            });
            return response.text;
        } catch (e) {
            console.error("Gemini API Error:", e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            throw new Error(`Gemini API Error: ${errorMessage}. Please check your API key.`);
        }

    } else if (provider === AIProvider.OpenRouter) {
        if (!apiKeys.openrouter) throw new Error("OpenRouter API key is missing.");
        
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKeys.openrouter}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000', // Example referrer, some models require it.
                    'X-Title': 'AI Code Problem Solver' // Example title
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`OpenRouter API error (${response.status}): ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (content) {
                return content;
            } else {
                throw new Error("Invalid response structure from OpenRouter API.");
            }
        } catch (e) {
             console.error("OpenRouter Fetch Error:", e);
             const errorMessage = e instanceof Error ? e.message : 'An unknown network error occurred.';
             throw new Error(`OpenRouter Error: ${errorMessage}`);
        }
    }
    
    throw new Error("Invalid AI provider specified.");
};
