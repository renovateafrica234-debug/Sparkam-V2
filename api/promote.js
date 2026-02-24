const { GoogleGenerativeAI } = require('@google/generative-ai');

let gemini, model;
if (process.env.GOOGLE_API_KEY) {
  gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  model = gemini.getGenerativeModel({ model: "gemini-pro" });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { artistName, trackTitle, genre, budget } = req.body;
  
  // ... generate campaign with AI or fallback ...
  
  return res.json({ success: true, campaign });
};
