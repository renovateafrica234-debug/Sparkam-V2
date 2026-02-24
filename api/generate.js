import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Sparkam AI Music Promo - AI Brain
 * Updated: Feb 24, 2026
 * Migration: Gemini 3 Flash (Replaces retired 1.5)
 */

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Validate API Key
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI Brain Configuration Missing: GOOGLE_API_KEY' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // FACT: gemini-1.5 was retired Feb 17, 2026.
    // Use 'gemini-3-flash' on the 'v1' stable endpoint.
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
    
    // Catch 404s from retired models
    if (error.message.includes("404") || error.message.includes("not found")) {
      return res.status(410).json({ error: "System Update: Transitioning to Gemini 3. Please refresh." });
    }
    
    return res.status(500).json({ error: "AI Brain failed to respond. Check Vercel logs." });
  }
}
