const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing API Key in Vercel" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using Gemini 3 Flash for 2026
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

    const result = await model.generateContent(req.body.prompt || "Generate music promo");
    const response = await result.response;
    
    return res.status(200).json({ text: response.text() });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "The AI Brain is offline." });
  }
};
