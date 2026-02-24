import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the SDK with the key from your Vercel Environment Variables
// Ensure the name here matches exactly what you typed in Vercel (GOOGLE_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function generatePromoContent(prompt) {
  try {
    // 2026 Update: gemini-3.1-flash is the current stable workhorse
    // We explicitly use the 'v1' API version for production stability
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash" 
    }, { apiVersion: 'v1' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("Sparkam AI Brain Error:", error);
    // This will help you see if it's still an Auth error or a Model error
    throw new Error(`AI Brain connection failed: ${error.message}`);
  }
}
