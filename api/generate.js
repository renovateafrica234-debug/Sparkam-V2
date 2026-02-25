import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Ensure GOOGLE_API_KEY is set in Vercel Environment Variables
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

  try {
    const { prompt } = req.body;

    // FEB 2026 FIX: Use gemini-3-flash (1.5 is retired)
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Sparkam Brain Error:", error);
    return res.status(500).json({ error: "AI Brain failed to ignite. Check Vercel logs." });
  }
}
