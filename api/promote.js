import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Brain with your Vercel Environment Variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { artistName, trackTitle } = req.body;

  try {
    // 1. Generate Strategy with Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are the Sparkam AI Brain. Create a viral 360 music promo plan for the artist "${artistName}" and their track "${trackTitle}". Focus on social media growth.`;
    
    const result = await model.generateContent(prompt);
    const aiStrategy = result.response.text();

    // 2. THE HANDSHAKE: Send the data to your Zapier Webhook
    if (process.env.ZAPIER_WEBHOOK_URL) {
      await fetch(process.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          artistName, 
          trackTitle, 
          strategy: aiStrategy,
          timestamp: new Date().toISOString(),
          status: "Sparked"
        }),
      });
    }

    // 3. Send the strategy back to your Dashboard
    res.status(200).json({ success: true, strategy: aiStrategy });

  } catch (error) {
    console.error("AI Brain Error:", error);
    res.status(500).json({ success: false, error: "Brain connection timed out. Try again." });
  }
}
