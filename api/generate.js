const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    const { artistName, trackTitle, genre, budget, dspLink } = req.body;
    
    // Validate input
    if (!artistName || !trackTitle || !genre || !budget) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: artistName, trackTitle, genre, budget' 
      });
    }
    
    // Check if API key exists
    if (!process.env.GOOGLE_API_KEY) {
      console.error('❌ GOOGLE_API_KEY not set in environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'API key not configured. Please contact support.' 
      });
    }
    
    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    console.log('🚀 Generating campaign for:', { artistName, trackTitle, genre, budget });
    
    // Create the prompt
    const prompt = `You are a professional music marketing strategist specializing in Nigerian and African music (Afrobeats, Afropop, Alté, etc.).

Create a comprehensive 30-day marketing campaign for:

Artist: ${artistName}
Track: ${trackTitle}
Genre: ${genre}
Budget: ₦${budget.toLocaleString()}
${dspLink ? `Spotify/DSP Link: ${dspLink}` : ''}

Generate a detailed strategy with:
1. Campaign Overview
2. TikTok Strategy (30 video concepts, hashtags, posting times)
3. Instagram Strategy (21 Reels concepts, Story ideas, engagement tactics)
4. Spotify Strategy (playlist targets, curator outreach template)
5. Influencer Strategy (target influencers, outreach approach)
6. Budget Breakdown (how to allocate the ₦${budget.toLocaleString()})
7. Week-by-Week Plan (4 weeks)
8. KPIs and Metrics

Format your response as a JSON object with these exact fields:
{
  "campaign_overview": "string",
  "tiktok_strategy": {
    "daily_posting_schedule": "string",
    "video_concepts": ["array of 30 concepts"],
    "hashtag_strategy": ["array of hashtags"],
    "best_posting_times": "string"
  },
  "instagram_strategy": {
    "content_mix": "string",
    "reels_concepts": ["array of 21 concepts"],
    "story_ideas": ["array"],
    "engagement_tactics": "string"
  },
  "spotify_strategy": {
    "playlist_pitching": "string",
    "target_playlists": ["array of 20 playlists"],
    "curator_outreach_template": "string"
  },
  "influencer_strategy": {
    "target_influencers": ["array"],
    "outreach_approach": "string",
    "collaboration_ideas": ["array"]
  },
  "budget_breakdown": {
    "tiktok_ads": "string",
    "instagram_ads": "string",
    "influencer_collaborations": "string",
    "playlist_pitching": "string",
    "content_creation": "string"
  },
  "week_by_week_plan": {
    "week_1": "string",
    "week_2": "string",
    "week_3": "string",
    "week_4": "string"
  },
  "kpis_and_metrics": {
    "target_streams": "string",
    "target_followers": "string",
    "target_engagement_rate": "string"
  }
}

Be specific, actionable, and realistic for the Nigerian music market.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('✅ Raw response received');
    
    // Parse the JSON response
    let campaignData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/```\n([\s\S]*?)\n```/) ||
                        responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        campaignData = JSON.parse(jsonText);
      } else {
        campaignData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      // If parsing fails, return the raw text with a structured wrapper
      campaignData = {
        campaign_overview: responseText.substring(0, 500) + '...',
        raw_strategy: responseText
      };
    }
    
    console.log('✅ Campaign generated successfully');
    
    // Return success response
    return res.status(200).json({
      success: true,
      campaign: {
        artistName,
        trackTitle,
        genre,
        budget,
        dspLink,
        strategy: campaignData,
        createdAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Campaign generation error:', error);
    
    // Handle specific errors
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({ 
        success: false, 
        error: 'API authentication failed. Invalid API key.' 
      });
    }
    
    // Generic error
    return res.status(500).json({
      success: false,
      error: 'Failed to generate campaign: ' + error.message
    });
  }
};
        
