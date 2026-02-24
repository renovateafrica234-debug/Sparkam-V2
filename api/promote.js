const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async function (req, res) {
  // Only allow POST requests from your dashboard
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { artistName, trackTitle } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Create a viral 360 music promo plan for ${artistName} - ${trackTitle}. Keep it punchy.`;
    
    const result = await model.generateContent(prompt);
    const strategy = result.response.text();

    // The Handshake: Send to Zapier
    if (process.env.ZAPIER_WEBHOOK_URL) {
      await fetch(process.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          artistName, 
          trackTitle, 
          strategy, 
          email: "beta@sparkam.com" 
        })
      });
    }

    res.status(200).json({ success: true, strategy });
  } catch (error) {
    console.error("Brain Error:", error);
    res.status(500).json({ success: false, error: "AI Brain is over-capacity." });
  }
};
