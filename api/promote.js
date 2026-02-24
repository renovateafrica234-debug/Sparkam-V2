import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { artistName, trackTitle, genre, budget } = req.body;
  
  try {
    // Generate campaign with AI
    const prompt = `Create a viral music promo plan for ${artistName} - ${trackTitle} (${genre}) with a budget of ${budget}.`;
    const result = await model.generateContent(prompt);
    const campaign = result.response.text();

    // The Zapier Handshake (The Brain connects here)
    if (process.env.ZAPIER_WEBHOOK_URL) {
      await fetch(process.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName, trackTitle, genre, budget, campaign })
      });
    }
  
    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    console.error("AI Brain Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
