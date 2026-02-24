import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { artistName, trackTitle } = req.body;

  try {
    // 1. Generate Strategy with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Create a viral 360 music promo plan for ${artistName} - ${trackTitle}.`;
    const result = await model.generateContent(prompt);
    const strategy = result.response.text();

    // 2. The Zapier Handshake
    if (process.env.ZAPIER_WEBHOOK_URL) {
      await fetch(process.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName, trackTitle, strategy, email: "beta@sparkam.com" })
      });
    }

    res.status(200).json({ success: true, strategy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
