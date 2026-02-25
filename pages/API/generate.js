const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing Key' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

    const result = await model.generateContent(req.body.prompt || "Music promo");
    const response = await result.response;
    
    return res.status(200).json({ text: response.text() });
  } catch (error) {
    return res.status(500).json({ error: "AI Error" });
  }
};
