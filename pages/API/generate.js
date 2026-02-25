const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const { prompt } = req.body;
    // FEB 2026: Using the live Gemini 3 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

    const result = await model.generateContent(prompt || "Generate music promo");
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Brain Error:", error);
    return res.status(500).json({ error: "AI Brain failed to ignite." });
  }
};
