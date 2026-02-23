import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { artist, track, budget } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are the Sparkam AI Brain. Analyze track "${track}" by "${artist}".
    Budget: ₦${budget}.
    Provide a comprehensive 360° blueprint:
    1. CURRENT STATS: Estimate current Spotify/Apple Music reach.
    2. TARGETING: Define the exact audience demographics for this sound.
    3. REACH PROJECTION: How many people will see this with ₦${budget}?
    4. CONTENT CREATOR: Provide 3 unique TikTok/Reel concepts with captions.
    5. SOCIAL PLAN: A 7-day posting schedule.
    Format with professional headings and bullet points.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // SUCCESS: Return the 'strategy' key that the frontend is looking for
    return res.status(200).json({ strategy: text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ strategy: "The AI Brain is over-capacity. Please refresh and try again." });
  }
}
