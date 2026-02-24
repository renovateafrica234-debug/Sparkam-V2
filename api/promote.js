import { GoogleGenerativeAI } from "@google/generative-ai";

// Sparkam AI Brain - Gemini AI Studio Integration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { artistName, trackTitle, fullName, email } = req.body;

  try {
    // 1. Initialize Gemini Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are the Sparkam AI Brain. 
    Create a global 360° marketing rollout plan for:
    Artist: ${artistName}
    Track: ${trackTitle}
    Focus on social media growth and viral potential.`;

    // 2. Generate the Strategy
    const result = await model.generateContent(prompt);
    const aiStrategy = result.response.text();

    // 3. THE HANDSHAKE: Send to Zapier Parent Zap
    if (process.env.ZAPIER_WEBHOOK_URL) {
      await fetch(process.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName || artistName,
          email: email || "beta-user@sparkam.com",
          artistName: artistName,
          trackTitle: trackTitle,
          strategy: aiStrategy,
          timestamp: new Date().toISOString()
        }),
      });
    }

    // 4. Return results to the Dashboard
    res.status(200).json({ 
      success: true, 
      strategy: aiStrategy 
    });

  } catch (error) {
    console.error('Gemini Brain Error:', error);
    res.status(500).json({ error: "The AI Brain is over-capacity. Please try again." });
  }
}
