const { GoogleGenerativeAI } = require('@google/generative-ai');

let gemini, model;
if (process.env.GOOGLE_API_KEY) {
  gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  model = gemini.getGenerativeModel({ model: "gemini-pro" });
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { trackTitle, artistName, genre, budget } = req.body;
    
    if (!trackTitle || !artistName || !genre) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    const budgetNum = parseInt(budget) || 100;
    
    const prompt = `Create a music promotion campaign for "${trackTitle}" by ${artistName}.
Genre: ${genre}, Budget: $${budgetNum}

Return only JSON:
{
  "overview": "Brief campaign strategy",
  "platforms": [
    {"platform": "tiktok", "budget": ${Math.floor(budgetNum * 0.4)}, "tactics": ["tactic1", "tactic2", "tactic3"]},
    {"platform": "instagram", "budget": ${Math.floor(budgetNum * 0.35)}, "tactics": ["tactic1", "tactic2", "tactic3"]},
    {"platform": "spotify", "budget": ${Math.floor(budgetNum * 0.25)}, "tactics": ["tactic1", "tactic2", "tactic3"]}
  ],
  "content": {
    "captions": ["caption1", "caption2", "caption3"],
    "hashtags": ["#tag1", "#tag2", "#tag3"]
  }
}`;

    let campaign = null;
    
    if (model) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        campaign = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (err) {
        console.warn('AI failed:', err.message);
      }
    }
    
    if (!campaign) {
      campaign = {
        overview: `Comprehensive ${genre} promotion for "${trackTitle}" by ${artistName}. AI-powered campaign across TikTok, Instagram, and Spotify.`,
        platforms: [
          {
            platform: "tiktok",
            budget: Math.floor(budgetNum * 0.4),
            tactics: ["Viral video creation", "Influencer outreach", "Trend integration"]
          },
          {
            platform: "instagram",
            budget: Math.floor(budgetNum * 0.35),
            tactics: ["Reels schedule", "Story takeovers", "Carousel posts"]
          },
          {
            platform: "spotify",
            budget: Math.floor(budgetNum * 0.25),
            tactics: ["Playlist pitching", "Canvas videos", "Pre-save campaign"]
          }
        ],
        content: {
          captions: [
            `🔥 New ${genre}! "${trackTitle}" by ${artistName} - stream now! 🎵`,
            `${artistName} dropped "${trackTitle}" and it's fire! 🚀`,
            `Can't stop playing this! ${artistName} - "${trackTitle}" ✨`
          ],
          hashtags: [`#${genre}`, "#NewMusic", `#${artistName.replace(/\s+/g,'')}`, "#MusicPromotion"]
        }
      };
    }
    
    return res.status(200).json({
      success: true,
      campaign
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
