import { GoogleGenerativeAI } from "@google/generative-ai";

// FACT: The environment variable in Vercel must be GOOGLE_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    // MANDATORY FEB 2026 UPDATE:
    // 1. Use 'gemini-3-flash' (1.5 is retired).
    // 2. Use 'v1' apiVersion for production stability.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash" 
    }, { apiVersion: 'v1' });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Sparkam AI Brain Failure:", error.message);
    
    // Diagnostic for the 404/Invalid Key loop
    if (error.message.includes("404") || error.message.includes("not found")) {
      return res.status(410).json({ error: "API Update Required: Model 1.5 is offline. Using Gemini 3." });
    }
    
    return res.status(500).json({ error: "AI Brain connection failed." });
  }
}
