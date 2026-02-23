import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { musicLink, budget, currency } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are the Sparkam AI Music Manager. 
    Analyze this music: ${musicLink}. 
    The artist has a budget of ${currency}${budget}.
    
    Provide a 360° Promotion Strategy:
    1. Genre & Audience: Who is this for?
    2. Content Plan: 3 Viral TikTok/Reel ideas tailored to this sound.
    3. Distribution: Where should the budget be spent (Social Ads, Playlisting, Radio)?
    4. Success Metric: Estimated reach for this budget.
    
    Keep the tone professional, encouraging, and sharp. Use bullet points.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ strategy: text });
  } catch (error) {
    return res.status(500).json({ error: "AI Brain calibration failed. Please try again." });
  }
}

