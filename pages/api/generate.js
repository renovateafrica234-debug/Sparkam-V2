const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(req.body.prompt || "Spark a music promo");
    const response = await result.response;
    return res.status(200).json({ text: response.text() });
  } catch (error) {
    return res.status(500).json({ error: "Brain Offline" });
  }
};
