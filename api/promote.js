import { GoogleGenerativeAI } from "@google/generative-ai";

// Sparkam AI Music Promo - Gemini AI Studio Integration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { musicLink, struggle, fullName, email, artistName } = req.body;

  try {
    // 1. Initialize Gemini AI Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are the Sparkam AI Brain, a professional music promo manager. 
    Analyze this request and provide a growth strategy:
    Artist Name: ${artistName}
    Music Link: ${musicLink}
    Current Challenge: ${struggle}`;

    // 2. Generate the Strategy
    const result = await model.generateContent(prompt);
    const aiStrategy = result.response.text();

    // 3. THE HANDSHAKE: Send results to Zapier Parent Zap
    if (process.env.ZAPIER_WEBHOOK_URL) {
      await fetch(process.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName,
          email: email,
          artistName: artistName,
          strategy: aiStrategy,
          link: musicLink,
          timestamp: new Date().toISOString()
        }),
      });
    }

    // 4. Return to your Sparkam Social Media UI
    res.status(200).json({ 
      success: true, 
      strategy: aiStrategy 
    });

  } catch (error) {
    console.error('Gemini Brain Error:', error);
    res.status(500).json({ error: "AI Brain failed to process music promo" });
  }
}
