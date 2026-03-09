const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    const { artistName, trackTitle, genre, budget } = req.body;
    
    if (!artistName || !trackTitle || !genre || !budget) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Google API key not configured' 
      });
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are a professional music marketing strategist specializing in Nigerian and African music (Afrobeats, Afropop, Alté, etc.).

Create a comprehensive 30-day marketing campaign for:

Artist: ${artistName}
Track: ${trackTitle}
Genre: ${genre}
Budget: ₦${budget.toLocaleString()}

Generate a detailed strategy with:
1. Campaign Overview
2. TikTok Strategy (30 video concepts)
3. Instagram Strategy (21 Reels concepts)
4. Spotify Strategy (20 playlist targets)
5. Influencer Strategy (target influencers)
6. Budget Breakdown
7. Week-by-Week Plan
8. KPIs and Metrics

Format as JSON with these fields:
{
  "campaign_overview": "string",
  "tiktok_strategy": {
    "video_concepts": ["array"],
    "hashtag_strategy": ["array"],
    "posting_schedule": "string"
  },
  "instagram_strategy": {
    "reels_concepts": ["array"],
    "story_ideas": ["array"]
  },
  "spotify_strategy": {
    "target_playlists": ["array"],
    "curator_template": "string"
  },
  "influencer_strategy": {
    "target_influencers": ["array"]
  },
  "budget_breakdown": {
    "tiktok_ads": "string",
    "instagram_ads": "string",
    "influencer": "string",
    "playlists": "string"
  },
  "week_by_week_plan": {
    "week_1": "string",
    "week_2": "string",
    "week_3": "string",
    "week_4": "string"
  },
  "kpis": {
    "target_streams": "string",
    "target_followers": "string"
  }
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let campaignData;
    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      campaignData = JSON.parse(jsonText);
    } catch (parseError) {
      campaignData = {
        campaign_overview: responseText.substring(0, 500),
        raw_strategy: responseText
      };
    }
    
    return res.status(200).json({
      success: true,
      campaign: {
        artistName,
        trackTitle,
        genre,
        budget,
        strategy: campaignData,
        createdAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate campaign: ' + error.message
    });
  }
};
