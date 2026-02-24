import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { artistName, trackTitle } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Create a viral music promo plan for ${artistName} - ${trackTitle}.`;
    
    const result = await model.generateContent(prompt);
    const aiStrategy = result.response.text();

    // The Zapier Handshake
    if (process.env.ZAPIER_WEBHOOK_URL) {
      await fetch(process.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName, trackTitle, strategy: aiStrategy })
      });
    }

    res.status(200).json({ success: true, strategy: aiStrategy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
