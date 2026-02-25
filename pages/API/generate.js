const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Initialize the AI Brain with your Vercel Key
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

  try {
    // 3. Use Gemini 3 Flash (Active Feb 2026)
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

    const { prompt } = req.body;
    const result = await model.generateContent(prompt || "Music promo idea");
    const text = result.response.text();

    // 4. Send the result back to the Dashboard
    return res.status(200).json({ text });
  } catch (error) {
    console.error("Build Error:", error.message);
    return res.status(500).json({ error: "AI Brain failed to ignite." });
  }
};
