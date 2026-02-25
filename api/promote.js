// api/promote.js - Bulletproof Sparkam Campaign Generator
// This file handles campaign generation with Google AI + fallback

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI (only if key exists)
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
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use POST.' 
    });
  }
  
  try {
    console.log('📥 Campaign request received');
    
    // Extract data
    const { artistName, trackTitle, genre, budget } = req.body;
    
    console.log('Request data:', { artistName, trackTitle, genre, budget });
    
    // Validation
    if (!artistName || !trackTitle || !genre) {
      console.log('❌ Validation failed - missing fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: artistName, trackTitle, genre'
      });
    }
    
    const budgetNum = parseInt(budget) || 14000;
    console.log('✅ Validation passed');
    
    // Build prompt
    const prompt = `Create a music promotion campaign for "${trackTitle}" by ${artistName}.
Genre: ${genre}
Budget: ₦${budgetNum}

Return ONLY valid JSON (no markdown, no backticks):
{
  "overview": "Brief 2-sentence campaign strategy for ${genre} music",
  "platforms": [
    {"platform": "tiktok", "budget": ${Math.floor(budgetNum * 0.4)}, "tactics": ["tactic 1", "tactic 2", "tactic 3"]},
    {"platform": "instagram", "budget": ${Math.floor(budgetNum * 0.35)}, "tactics": ["tactic 1", "tactic 2", "tactic 3"]},
    {"platform": "spotify", "budget": ${Math.floor(budgetNum * 0.25)}, "tactics": ["tactic 1", "tactic 2", "tactic 3"]}
  ],
  "content": {
    "captions": ["engaging caption 1", "engaging caption 2", "engaging caption 3"],
    "hashtags": ["#${genre}", "#tag2", "#tag3", "#tag4", "#tag5"]
  }
}`;

    let campaign = null;
    
    // Try Google AI (with timeout)
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
        
        // Clean and parse
        const cleanText = text.replace(/```json|```/g, '').trim();
        campaign = JSON.parse(cleanText);
        
        console.log('✅ AI campaign generated successfully');
        
      } catch (aiError) {
        console.warn('⚠️  AI generation failed:', aiError.message);
        console.warn('Will use fallback campaign');
        campaign = null;
      }
    } else {
      console.log('⚠️  No GOOGLE_API_KEY, using fallback immediately');
    }
    
    // Fallback campaign (always works)
    if (!campaign) {
      console.log('📦 Generating fallback campaign');
      
      campaign = {
        overview: `Comprehensive ${genre} promotion campaign for "${trackTitle}" by ${artistName}. AI-powered autonomous execution across TikTok, Instagram, and Spotify targeting engaged music fans with ₦${budgetNum.toLocaleString()} budget allocation.`,
        platforms: [
          {
            platform: "tiktok",
            budget: Math.floor(budgetNum * 0.4),
            tactics: [
              "Viral short-form video creation using track audio and trending challenges",
              "Micro-influencer outreach targeting ${genre} content creators (10K-100K followers)",
              "Real-time trend integration with branded sound usage and hashtag campaigns"
            ]
          },
          {
            platform: "instagram",
            budget: Math.floor(budgetNum * 0.35),
            tactics: [
              "Automated Reels schedule (3x/week) optimized for peak engagement times",
              "Story takeovers with ${genre} fan pages and collaborative posts",
              "AI-generated carousel posts highlighting lyrics and artist journey"
            ]
          },
          {
            platform: "spotify",
            budget: Math.floor(budgetNum * 0.25),
            tactics: [
              "Playlist pitching to 50+ curators in ${genre} and related genres",
              "Canvas video auto-creation and upload for enhanced visual experience",
              "Pre-save campaign automation with email retargeting sequences"
            ]
          }
        ],
        content: {
          captions: [
            `🔥 New ${genre} alert! "${trackTitle}" by ${artistName} is taking over the airwaves. This is the vibe we've been waiting for! Stream now on all platforms 🎵`,
            `When ${artistName} drops, you know it's about to be legendary. "${trackTitle}" hits different and I can't stop playing it on repeat! 🚀💯`,
            `This is the soundtrack of the season! ${artistName}'s "${trackTitle}" is pure ${genre} excellence. Add it to your playlist right now! ✨🎶`
          ],
          hashtags: [`#${genre}`, "#NewMusic", `#${artistName.replace(/\s+/g,'')}`, "#MusicPromotion", "#NowPlaying", "#AfricanMusic"]
        },
        source: 'fallback'
      };
      
      console.log('✅ Fallback campaign generated');
    }
    
    // Add metadata
    campaign.id = `camp_${Date.now()}`;
    campaign.created = new Date().toISOString();
    campaign.track = { artistName, trackTitle, genre };
    campaign.budget = budgetNum;
    
    // Send to Zapier webhook (if configured)
    if (process.env.ZAPIER_WEBHOOK_URL) {
      try {
        console.log('📤 Sending to Zapier webhook...');
        
        await fetch(process.env.ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
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
        // Don't fail the request if Zapier is down
      }
    }
    
    console.log('✅ Returning campaign to client');
    
    // Return success
    return res.status(200).json({
      success: true,
      campaign: campaign,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error);
    console.error('Error stack:', error.stack);
    
    // Return detailed error
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
      
