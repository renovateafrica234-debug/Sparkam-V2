const { GoogleGenerativeAI } = require('@google/generative-ai');

let gemini, model;
try {
  if (process.env.GOOGLE_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    model = gemini.getGenerativeModel({ model: "gemini-pro" });
    console.log('✅ Google AI initialized');
  } else {
    console.warn('⚠️  GOOGLE_API_KEY not set - will use fallback');
  }
} catch (initError) {
  console.error('❌ Google AI init failed:', initError.message);
}

// REALISTIC METRICS CALCULATOR
function calculateRealisticMetrics(budget) {
  // Conservative multipliers for Nigerian market
  const streams = Math.floor(budget * 0.1); // 10% of budget = streams (₦70K = 7K streams)
  const reach = Math.floor(budget * 2); // 2x budget = reach (₦70K = 140K reach)
  const engagement = "3-5%"; // Realistic engagement rate
  const roi = Math.floor(budget * 1.8); // 1.8x ROI (₦70K = ₦126K value)
  
  return { streams, reach, engagement, roi };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    console.log('📥 Campaign request received');
    
    const { dspLink, artistName, trackTitle, genre, budget } = req.body;
    
    if (!artistName || !trackTitle || !genre) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const budgetNum = parseInt(budget) || 14000;
    const metrics = calculateRealisticMetrics(budgetNum);
    
    // REALISTIC PROMPT
    const prompt = `Create an AUTONOMOUS AI music promotion campaign for "${trackTitle}" by ${artistName}.
Genre: ${genre}
Budget: ₦${budgetNum}

CRITICAL: Use REALISTIC, ACHIEVABLE numbers for Nigerian music market. This is a ₦${budgetNum} campaign (~$${Math.floor(budgetNum/1550)} USD).

Return ONLY valid JSON (no markdown):
{
  "overview": "2-3 sentences about AUTONOMOUS AI execution with REALISTIC projected results",
  "metrics": {
    "estimatedStreams": ${metrics.streams},
    "totalReach": ${metrics.reach},
    "engagementRate": "${metrics.engagement}",
    "roi": "${metrics.roi}"
  },
  "platforms": [
    {
      "platform": "tiktok",
      "budget": ${Math.floor(budgetNum * 0.4)},
      "reach": "${Math.floor(metrics.reach * 0.45)}",
      "tactics": [
        "🤖 AI autonomously creates and posts 3 videos daily using track audio",
        "🤖 Autonomous outreach to 20-30 ${genre} micro-influencers",
        "🤖 Real-time trend integration - AI adapts automatically"
      ]
    },
    {
      "platform": "instagram", 
      "budget": ${Math.floor(budgetNum * 0.35)},
      "reach": "${Math.floor(metrics.reach * 0.35)}",
      "tactics": [
        "🤖 AI schedules 21 Reels/Stories over 30 days at peak times",
        "🤖 Automated engagement with ${genre} audience",
        "🤖 Story takeover coordination with fan pages"
      ]
    },
    {
      "platform": "spotify",
      "budget": ${Math.floor(budgetNum * 0.25)},
      "streams": "${Math.floor(metrics.streams * 0.6)}",
      "tactics": [
        "🤖 AI pitches to 50+ ${genre} playlist curators",
        "🤖 Canvas video auto-created and uploaded",
        "🤖 Pre-save campaign automation"
      ]
    }
  ],
  "content": {
    "captions": ["engaging ${genre} caption", "another caption", "third caption"],
    "hashtags": ["#${genre}", "#NewMusic", "#${artistName.replace(/\s+/g,'')}", "#AIPromo"]
  }
}`;

    let campaign = null;
    
    if (model && process.env.GOOGLE_API_KEY) {
      try {
        console.log('🤖 Calling Google AI...');
        
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI timeout')), 8000)
          )
        ]);
        
        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json|```/g, '').trim();
        campaign = JSON.parse(cleanText);
        
        console.log('✅ AI campaign generated');
        
      } catch (aiError) {
        console.warn('⚠️  AI failed:', aiError.message);
        campaign = null;
      }
    }
    
    // REALISTIC FALLBACK
    if (!campaign) {
      console.log('📦 Using realistic fallback');
      
      campaign = {
        overview: `Autonomous AI campaign for "${trackTitle}" by ${artistName}. Sparkam's AI will execute a 360° ${genre} strategy autonomously across TikTok, Instagram, and Spotify, projecting ${metrics.streams.toLocaleString()}+ streams and ${metrics.reach.toLocaleString()}+ reach over 30 days with zero manual work.`,
        
        metrics: {
          estimatedStreams: metrics.streams,
          totalReach: metrics.reach,
          engagementRate: metrics.engagement,
          roi: metrics.roi.toLocaleString(),
          disclaimer: "Conservative projections based on similar campaigns"
        },
        
        platforms: [
          {
            platform: "tiktok",
            budget: Math.floor(budgetNum * 0.4),
            reach: Math.floor(metrics.reach * 0.45).toLocaleString(),
            videoViews: Math.floor(budgetNum * 1.2).toLocaleString(),
            tactics: [
              `🤖 AI autonomously creates and posts 3 videos daily using "${trackTitle}" audio`,
              `🤖 Autonomous outreach to 20-30 ${genre} micro-influencers (10K-100K followers)`,
              "🤖 Real-time trend detection - AI adapts to trending challenges automatically",
              "🤖 Hashtag optimization based on performance data"
            ]
          },
          {
            platform: "instagram",
            budget: Math.floor(budgetNum * 0.35),
            reach: Math.floor(metrics.reach * 0.35).toLocaleString(),
            reelsPlays: Math.floor(budgetNum * 0.8).toLocaleString(),
            tactics: [
              "🤖 AI schedules 21 Reels/Stories over 30 days at peak engagement times (9AM, 3PM, 9PM WAT)",
              `🤖 Automated engagement with ${genre} fan accounts - AI comments and likes strategically`,
              `🤖 Story takeover coordination with 5-10 ${genre} fan pages`,
              "🤖 AI-generated carousel posts with track highlights"
            ]
          },
          {
            platform: "spotify",
            budget: Math.floor(budgetNum * 0.25),
            streams: Math.floor(metrics.streams * 0.6).toLocaleString(),
            playlistPlacements: "15-25 playlists",
            tactics: [
              `🤖 AI autonomously pitches to 50+ ${genre} and related playlist curators`,
              "🤖 Canvas video auto-created with track artwork + AI visuals",
              "🤖 Pre-save campaign automation with targeted email sequences",
              "🤖 Automated curator follow-ups based on response rates"
            ]
          }
        ],
        
        content: {
          captions: [
            `🔥 New ${genre} alert! "${trackTitle}" by ${artistName} - AI is getting this to the right people! Stream now 🎵`,
            `When ${artistName} drops "${trackTitle}", our AI gets to work! 24/7 promotion across all platforms 🚀`,
            `AI-powered push for "${trackTitle}" by ${artistName}! This is ${genre} done right ✨🎶`
          ],
          hashtags: [`#${genre}`, "#NewMusic", `#${artistName.replace(/\s+/g,'')}`, "#AIPromo", "#SparkamAI"],
          schedule: "AI posts at 9AM, 3PM, 9PM WAT daily for maximum engagement"
        }
      };
    }
    
    campaign.id = `camp_${Date.now()}`;
    campaign.created = new Date().toISOString();
    campaign.track = { dspLink, artistName, trackTitle, genre };
    campaign.budget = budgetNum;
    
    // ZAPIER WEBHOOK - FIXED!
    if (process.env.ZAPIER_WEBHOOK_URL) {
      try {
        console.log('📤 Sending to Zapier...');
        
        const zapierData = {
          // Track Info
          artistName: artistName,
          trackTitle: trackTitle,
          genre: genre,
          dspLink: dspLink || '',
          budget: budgetNum,
          
          // Metrics
          estimatedStreams: campaign.metrics.estimatedStreams,
          totalReach: campaign.metrics.totalReach,
          engagementRate: campaign.metrics.engagementRate,
          roi: campaign.metrics.roi,
          
          // Campaign Overview
          overview: campaign.overview,
          
          // Timestamps
          timestamp: new Date().toISOString(),
          campaignId: campaign.id,
          
          // Source
          source: 'sparkam-dashboard',
          
          // Full Campaign (as JSON string for storage)
          fullCampaign: JSON.stringify(campaign)
        };
        
        const response = await fetch(process.env.ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(zapierData)
        });
        
        console.log('✅ Zapier webhook sent:', response.status);
        
      } catch (zapierError) {
        console.warn('⚠️  Zapier failed:', zapierError.message);
      }
    }
    
    return res.status(200).json({
      success: true,
      campaign: campaign,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: '500',
        message: error.message || 'Internal server error'
      }
    });
  }
};
