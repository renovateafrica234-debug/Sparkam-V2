import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GOOGLE_API_KEY in Vercel' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // FEB 2026 Update: Use gemini-3-flash
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

    const { prompt } = req.body;
    const result = await model.generateContent(prompt || "Generate music promo");
    const response = await result.response;
    
    return res.status(200).json({ text: response.text() });
  } catch (error) {
    console.error("Brain Error:", error.message);
    return res.status(500).json({ error: "AI Brain failed to ignite." });
  }
}
