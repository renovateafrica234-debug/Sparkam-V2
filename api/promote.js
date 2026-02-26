const { GoogleGenerativeAI } = require('@google/generative-ai');

let gemini, model;
if (process.env.GOOGLE_API_KEY) {
  gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  model = gemini.getGenerativeModel({ model: "gemini-pro" });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    const { dspLink, trackTitle, artistName, genre, budget } = req.body;
    
    if (!trackTitle || !artistName || !genre) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const budgetNum = parseInt(budget) || 14000;
    
    // ENHANCED PROMPT - Emphasizes Autonomous + Metrics
    const prompt = `You are an AI-powered autonomous music promotion expert. Create a detailed, data-driven campaign for "${trackTitle}" by ${artistName}.

Genre: ${genre}
Budget: ₦${budgetNum}
${dspLink ? `DSP Link: ${dspLink}` : ''}

CRITICAL REQUIREMENTS:
1. Include SPECIFIC NUMBERS for streams, reach, engagement
2. Emphasize AUTONOMOUS EXECUTION by AI (not manual work)
3. Show ROI and value projections
4. Include timeline and automation details
5. Make it clear this is AI-powered, not human labor

Return ONLY valid JSON:
{
  "overview": "Brief autonomous campaign description emphasizing AI execution and projected results (2-3 sentences with numbers)",
  "metrics": {
    "estimatedStreams": [number between budget*20 and budget*40],
    "totalReach": [number between budget*100 and budget*200],
    "engagementRate": "[8-15]%",
    "roiProjection": "₦[budget*2.5 to budget*4]",
    "campaignDuration": "30 days",
    "automationLevel": "100% AI-Powered"
  },
  "platforms": [
    {
      "platform": "tiktok",
      "budget": ${Math.floor(budgetNum * 0.4)},
      "metrics": {
        "reach": "[calculate 40% of totalReach]",
        "videoViews": "[calculate number]",
        "engagement": "[calculate percentage]"
      },
      "automation": [
        "AI-generated video content posted 3x daily at optimal times",
        "Autonomous influencer outreach to 50+ micro-creators",
        "Real-time trend detection and adaptation"
      ]
    },
    {
      "platform": "instagram", 
      "budget": ${Math.floor(budgetNum * 0.35)},
      "metrics": {
        "reach": "[calculate 35% of totalReach]",
        "storyViews": "[calculate number]",
        "reelsPlays": "[calculate number]"
      },
      "automation": [
        "AI schedules 21 posts/stories over 30 days",
        "Automated engagement with target audience",
        "Story takeover coordination with fan pages"
      ]
    },
    {
      "platform": "spotify",
      "budget": ${Math.floor(budgetNum * 0.25)},
      "metrics": {
        "playlistPlacements": "[10-30 playlists]",
        "estimatedStreams": "[calculate number]",
        "saveRate": "[5-12]%"
      },
      "automation": [
        "AI pitches to ${genre} playlist curators automatically",
        "Canvas video auto-created and uploaded",
        "Pre-save campaign with email retargeting"
      ]
    }
  ],
  "content": {
    "captions": [
      "[Engaging ${genre} caption 1 with emojis]",
      "[Engaging ${genre} caption 2 with emojis]", 
      "[Engaging ${genre} caption 3 with emojis]"
    ],
    "hashtags": ["#${genre}", "#NewMusic", "#${artistName.replace(/\s+/g,'')}", "#MusicPromotion", "#Trending"],
    "automatedSchedule": "AI posts at peak engagement times: 9AM, 3PM, 9PM WAT"
  },
  "timeline": {
    "week1": "AI launches TikTok campaign + influencer outreach",
    "week2": "Instagram Reels rollout + engagement automation",
    "week3": "Spotify playlist pitching + pre-save campaign",
    "week4": "Optimization phase - AI adjusts based on performance"
  }
}

REMEMBER: 
- Use REAL NUMBERS not ranges like "X-Y"
- Emphasize AUTONOMOUS/AI execution in every platform
- Make projections realistic but exciting
- Show this is NOT manual work, it's AI doing everything`;

    let campaign = null;
    
    if (model && process.env.GOOGLE_API_KEY) {
      try {
        console.log('🤖 Calling Google AI with enhanced prompt...');
        
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI timeout')), 9000)
          )
        ]);
        
        const response = await result.response;
        const text = response.text();
        
        const cleanText = text.replace(/```json|```/g, '').trim();
        campaign = JSON.parse(cleanText);
        
        console.log('✅ Enhanced campaign generated');
        
      } catch (aiError) {
        console.warn('⚠️  AI generation failed:', aiError.message);
        campaign = null;
      }
    }
    
    // ENHANCED FALLBACK with real metrics
    if (!campaign) {
      console.log('📦 Using enhanced fallback');
      
      const estimatedStreams = Math.floor(budgetNum * 30);
      const totalReach = budgetNum * 150;
      const roiValue = Math.floor(budgetNum * 3);
      
      campaign = {
        overview: `Autonomous AI campaign for "${trackTitle}" targeting ${genre} audiences. Sparkam's AI will execute a 360° strategy autonomously across TikTok, Instagram, and Spotify, projecting ${estimatedStreams.toLocaleString()}+ streams with ${totalReach.toLocaleString()}+ total reach over 30 days - all with zero manual work from you.`,
        
        metrics: {
          estimatedStreams: estimatedStreams,
          totalReach: totalReach,
          engagementRate: "11%",
          roiProjection: `₦${roiValue.toLocaleString()}`,
          campaignDuration: "30 days",
          automationLevel: "100% AI-Powered"
        },
        
        platforms: [
          {
            platform: "tiktok",
            budget: Math.floor(budgetNum * 0.4),
            metrics: {
              reach: `${Math.floor(totalReach * 0.4).toLocaleString()}+`,
              videoViews: `${Math.floor(budgetNum * 80).toLocaleString()}+`,
              engagement: "13%"
            },
            automation: [
              `AI creates and posts 3 viral-style videos daily using "${trackTitle}" audio`,
              `Autonomous outreach to 50+ ${genre} micro-influencers (10K-100K followers)`,
              "Real-time trend integration - AI adapts to trending challenges hourly",
              "Automated hashtag optimization based on performance data"
            ]
          },
          {
            platform: "instagram",
            budget: Math.floor(budgetNum * 0.35),
            metrics: {
              reach: `${Math.floor(totalReach * 0.35).toLocaleString()}+`,
              storyViews: `${Math.floor(budgetNum * 60).toLocaleString()}+`,
              reelsPlays: `${Math.floor(budgetNum * 70).toLocaleString()}+`
            },
            automation: [
              "AI schedules 21 Reels/Stories over 30 days at peak engagement times (9AM, 3PM, 9PM WAT)",
              `Automated engagement with ${genre} fan accounts - AI comments, likes, follows strategically`,
              `Story takeover coordination with 10+ ${genre} fan pages (50K+ followers each)`,
              "AI-generated carousel posts highlighting lyrics and artist journey"
            ]
          },
          {
            platform: "spotify",
            budget: Math.floor(budgetNum * 0.25),
            metrics: {
              playlistPlacements: "15-25 playlists",
              estimatedStreams: `${Math.floor(budgetNum * 15).toLocaleString()}+`,
              saveRate: "8%"
            },
            automation: [
