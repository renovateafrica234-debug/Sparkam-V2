import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CRITICAL: Ensure this matches the key name in Vercel settings
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'System Configuration Error: Missing API Key' });
  }

  try {
    const { prompt } = req.body;
    const genAI = new GoogleGenerativeAI(apiKey);

    // FIX: gemini-1.5 is retired. Transitioning to Gemini 3 Flash.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash" 
    }, { apiVersion: 'v1' });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Sparkam AI Failure:", error.message);
    
    // Explicitly handle the 404/410 errors from retired models
    if (error.message.includes("404") || error.message.includes("not found")) {
      return res.status(410).json({ error: "API Update Required: Model 1.5 is offline." });
    }
    
    return res.status(500).json({ error: "The AI Brain is currently unresponsive." });
  }
}
