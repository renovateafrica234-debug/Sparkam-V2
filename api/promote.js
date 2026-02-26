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

module.exports = async (req, res) => {
  // CORS headers - UNCHANGED
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use POST.' 
    });
  }
  
  try {
    console.log('📥 Campaign request received');
    
    // Extract data - UNCHANGED
    const { dspLink, artistName, trackTitle, genre, budget } = req.body;
    
    console.log('Request data:', { dspLink, artistName, trackTitle, genre, budget });
    
    // Validation - UNCHANGED
    if (!artistName || !trackTitle || !genre) {
      console.log('❌ Validation failed - missing fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: artistName, trackTitle, genre'
      });
    }
    
    const budgetNum = parseInt(budget) || 14000;
    console.log('✅ Validation passed');
    
    // ⭐ ENHANCED PROMPT - This is the main change!
    const prompt = `Create an AUTONOMOUS AI music promotion campaign for "${trackTitle}" by ${artistName}.
Genre: ${genre}
Budget: ₦${budgetNum}

CRITICAL: This campaign will be executed 100% AUTONOMOUSLY by AI. Include specific numbers and automation details.

Return ONLY valid JSON (no markdown, no backticks):
{
  "overview": "2-3 sentences emphasizing AUTONOMOUS AI execution with projected numbers (streams, reach)",
  "metrics": {
    "estimatedStreams": ${budgetNum * 30},
    "totalReach": ${budgetNum * 150},
    "engagementRate": "11%",
    "roi": "${budgetNum * 3}"
  },
  "platforms": [
    {
      "platform": "tiktok",
      "budget": ${Math.floor(budgetNum * 0.4)},
      "reach": "${Math.floor(budgetNum * 60)}",
      "tactics": [
        "AI autonomously creates and posts 3 videos daily using track audio",
        "Autonomous influencer outreach to 50+ ${genre} creators",
        "Real-time trend detection and adaptation by AI"
      ]
    },
    {
      "platform": "instagram", 
      "budget": ${Math.floor(budgetNum * 0.35)},
      "reach": "${Math.floor(budgetNum * 52)}",
      "tactics": [
        "AI schedules 21 Reels/Stories over 30 days automatically",
        "Automated engagement with target ${genre} audience",
        "Story takeover coordination with fan pages"
      ]
    },
    {
      "platform": "spotify",
      "budget": ${Math.floor(budgetNum * 0.25)},
      "streams": "${Math.floor(budgetNum * 15)}",
      "tactics": [
        "AI autonomously pitches to 100+ ${genre} playlist curators",
        "Canvas video auto-created and uploaded",
        "Pre-save campaign with automated email retargeting"
      ]
    }
  ],
  "content": {
    "captions": ["engaging ${genre} caption with emojis", "another engaging caption", "third caption"],
    "hashtags": ["#${genre}", "#NewMusic", "#${artistName.replace(/\s+/g,'')}", "#AIPromo", "#MusicMarketing"]
  }
}`;

    let campaign = null;
    
    // Try Google AI - UNCHANGED
    if (model && process.env.GOOGLE_API_KEY) {
      try {
        console.log('🤖 Calling Google AI...');
        
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI timeout after 8 seconds')), 8000)
          )
        ]);
        
        const response = await result.response;
        const text = response.text();
        
        console.log('📝 AI response received, length:', text.length);
        
        const cleanText = text.replace(/```json|```/g, '').trim();
        campaign = JSON.parse(cleanText);
        
        console.log('✅ AI campaign generated successfully');
        
      } catch (aiError) {
        console.warn('⚠️  AI generation failed:', aiError.message);
        campaign = null;
      }
    } else {
      console.log('⚠️  No GOOGLE_API_KEY, using fallback immediately');
    }
    
    // ⭐ ENHANCED FALLBACK - This is the other main change!
    if (!campaign) {
      console.log('📦 Generating enhanced fallback campaign');
      
      const estimatedStreams = budgetNum * 30;
      const totalReach = budgetNum * 150;
      const roiValue = budgetNum * 3;
      
      campaign = {
        overview: `Autonomous AI campaign for "${trackTitle}" by ${artistName}. Sparkam's AI will execute a 360° ${genre} strategy autonomously across TikTok, Instagram, and Spotify, projecting ${estimatedStreams.toLocaleString()}+ streams and ${totalReach.toLocaleString()}+ total reach over 30 days with zero manual work.`,
        
        metrics: {
          estimatedStreams: estimatedStreams,
          totalReach: totalReach,
          engagementRate: "11%",
          roi: roiValue.toLocaleString()
        },
        
        platforms: [
          {
            platform: "tiktok",
            budget: Math.floor(budgetNum * 0.4),
            reach: Math.floor(budgetNum * 60).toLocaleString(),
            tactics: [
              `🤖 AI autonomously creates and posts 3 viral-style videos daily using "${trackTitle}" audio`,
              `🤖 Autonomous outreach to 50+ ${genre} micro-influencers (10K-100K followers)`,
              "🤖 Real-time trend integration - AI adapts to trending challenges automatically"
            ]
          },
          {
            platform: "instagram",
            budget: Math.floor(budgetNum * 0.35),
            reach: Math.floor(budgetNum * 52).toLocaleString(),
            tactics: [
              "🤖 AI schedules 21 Reels/Stories over 30 days at peak engagement times",
              `🤖 Automated engagement with ${genre} fan accounts - AI comments, likes strategically`,
              `🤖 Story takeover coordination with 10+ ${genre} fan pages automatically`
            ]
          },
          {
            platform: "spotify",
            budget: Math.floor(budgetNum * 0.25),
            streams: Math.floor(budgetNum * 15).toLocaleString(),
            tactics: [
              `🤖 AI autonomously pitches to 100+ ${genre} playlist curators`,
              "🤖 Canvas video auto-created using track artwork + AI visuals",
              "🤖 Pre-save campaign automation with email retargeting"
            ]
          }
        ],
        
        content: {
          captions: [
            `🔥 New ${genre} alert! "${trackTitle}" by ${artistName} is taking over. AI pushing this everywhere - streams going crazy! 🎵✨`,
            `When ${artistName} drops "${trackTitle}", the algorithm responds! AI working 24/7 getting this to the right ears! 🚀💯`,
            `AI meets ${genre}! "${trackTitle}" by ${artistName} is everywhere right now. Join the wave! 🌊🎶`
          ],
          hashtags: [`#${genre}`, "#NewMusic", `#${artistName.replace(/\s+/g,'')}`, "#AIPromo", "#SparkamAI", "#AutonomousMarketing"]
        },
        
        source: 'enhanced_fallback'
      };
      
      console.log('✅ Enhanced fallback campaign generated');
    }
    
    // Add metadata - UNCHANGED
    campaign.id = `camp_${Date.now()}`;
    campaign.created = new Date().toISOString();
    campaign.track = { dspLink, artistName, trackTitle, genre };
    campaign.budget = budgetNum;
    
    // Zapier webhook - UNCHANGED
    if (process.env.ZAPIER_WEBHOOK_URL) {
      try {
        console.log('📤 Sending to Zapier webhook...');
        await fetch(process.env.ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dspLink,
            artistName,
            trackTitle,
            genre,
            budget: budgetNum,
            campaign,
            timestamp: new Date().toISOString(),
            source: 'sparkam-dashboard'
          })
        });
        console.log('✅ Zapier webhook sent');
      } catch (zapierError) {
        console.warn('⚠️  Zapier webhook failed:', zapierError.message);
      }
    }
    
    console.log('✅ Returning campaign to client');
    
    // Return success - UNCHANGED
    return res.status(200).json({
      success: true,
      campaign: campaign,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: {
        code: '500',
        message: error.message || 'Internal server error',
        details: 'Check Vercel function logs for more information'
      }
    });
  }
};
      
