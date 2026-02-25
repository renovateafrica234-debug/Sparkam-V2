const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });
    const { prompt } = req.body;
    
    const result = await model.generateContent(prompt || "Music promotion idea");
    const response = await result.response;
    
    return res.status(200).json({ text: response.text() });
  } catch (error) {
    return res.status(500).json({ error: "AI Brain Error" });
  }
};
