import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure your variable in Vercel is exactly GOOGLE_API_KEY (all caps)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function sparkAI(prompt) {
  try {
    // UPDATED FOR FEB 2026:
    // 1. Use "gemini-3-flash" (the current stable default)
    // 2. Explicitly set apiVersion to 'v1'
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash" 
    }, { apiVersion: 'v1' });

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Error:", error.message);
    throw error;
  }
}
