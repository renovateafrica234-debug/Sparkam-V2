import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // 1. Safety Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { artistName, trackTitle } = req.body;

  try {
    // 2. Wake up the Gemini Brain
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Create a viral 360 music promo plan for ${artistName} - ${trackTitle}.`;
    
    const result = await model.generateContent(prompt);
    const strategy = result.response.text();

    // 3. The Handshake: Send to Zapier
    if (process.env.ZAPIER_WEBHOOK_URL) {
      await fetch(process.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          artistName, 
          trackTitle, 
          strategy,
          status: "Sparked from Dashboard" 
        }),
      });
    }

    // 4. Send back to the Sparkam Dashboard
    res.status(200).json({ success: true, strategy });

  } catch (error) {
    console.error("Brain Failure:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
