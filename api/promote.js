const { GoogleGenerativeAI } = require('@google/generative-ai');

let gemini, model;
try {
  if (process.env.GOOGLE_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    model = gemini.getGenerativeModel({ model: "gemini-pro" });
    console.log('✅ Google AI initialized');
  }
} catch (initError) {
  console.error('❌ Init failed:', initError.message);
}

function calculateMetrics(budget) {
  const streams = Math.floor(budget * 0.1);
  const reach = Math.floor(budget * 2);
  
  return { 
    streams, 
    reach, 
    engagement: "3-5%",
    roi: Math.floor(budget * 1.8),
    tiktok: {
      budget: Math.floor(budget * 0.4),
      reach: Math.floor(reach * 0.45),
      views: Math.floor(budget * 1.2)
    },
    instagram: {
      budget: Math.floor(budget * 0.35),
      reach: Math.floor(reach * 0.35),
      reelsPlays: Math.floor(budget * 0.8)
    },
    spotify: {
      budget: Math.floor(budget * 0.25),
      streams: Math.floor(streams * 0.6)
    }
  };
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
    const { dspLink, artistName, trackTitle, genre, budget } = req.body;
    
    if (!artistName || !trackTitle || !genre) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }
    
    const budgetNum = parseInt(budget) || 14000;
    const metrics = calculateMetrics(budgetNum);
    
    let campaign = null;
    
    // Try AI generation
    if (model && process.env.GOOGLE_API_KEY) {
      try {
        const prompt = `Create an AUTONOMOUS AI campaign for "${trackTitle}" by ${artistName} (${genre}), Budget: ₦${budgetNum}.
Return valid JSON with tactics array for each platform.`;
        
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
        ]);
        
        const text = (await result.response).text();
        campaign = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (err) {
        console.warn('AI failed:', err.message);
      }
    }
    
    // BACKWARD COMPATIBLE FALLBACK
    if (!campaign) {
      const tiktokTactics = [
        `🤖 Day 1-30: AI creates 90 videos total (3 daily at 9AM, 3PM, 9PM WAT) using "${trackTitle}" audio`,
        `🤖 Hour 1: AI scans 100+ trending ${genre} hashtags, selects top 10 for integration`,
        `🤖 Daily 10AM: AI pitches 5 micro-influencers (10K-100K followers) with personalized DMs`,
        `🤖 Real-time: If video hits 500 views in 1 hour → AI boosts with ₦300`
      ];
      
      const instagramTactics = [
        "🤖 AI schedules 21 Reels + 30 Stories over 30 days at peak engagement times (9AM, 3PM, 9PM WAT)",
        `🤖 Daily: AI engages with 50 ${genre} fan accounts (likes, comments, strategic follows)`,
        `🤖 Weekly: AI coordinates takeovers with 2-3 ${genre} fan pages (20K+ followers)`,
        "🤖 Real-time: AI responds to DMs from engaged followers within 10 minutes"
      ];
      
      const spotifyTactics = [
        `🤖 Hour 1: AI generates personalized pitches for 50 ${genre} playlist curators`,
        "🤖 Day 1-7: AI sends pitches in waves (10/day), tracks open rates automatically",
        `🤖 AI creates Canvas video using track artwork + animated ${genre} visuals`,
        "🤖 Real-time: If curator opens email → AI sends follow-up with streaming stats within 2 hours"
      ];
      
      campaign = {
        overview: `Autonomous AI campaign for "${trackTitle}" by ${artistName}. Sparkam's AI executes a 360° ${genre} strategy 24/7 across TikTok, Instagram, and Spotify, projecting ${metrics.streams.toLocaleString()}+ streams and ${metrics.reach.toLocaleString()}+ reach over 30 days with zero manual work.`,
        
        metrics: {
          estimatedStreams: metrics.streams,
          totalReach: metrics.reach,
          engagementRate: metrics.engagement,
          roi: metrics.roi.toLocaleString()
        },
        
        platforms: [
          {
            platform: "tiktok",
            budget: metrics.tiktok.budget,
            reach: metrics.tiktok.reach.toLocaleString(),
            videoViews: metrics.tiktok.views.toLocaleString(),
            tactics: tiktokTactics  // OLD FORMAT - for compatibility
          },
          {
            platform: "instagram",
            budget: metrics.instagram.budget,
            reach: metrics.instagram.reach.toLocaleString(),
            reelsPlays: metrics.instagram.reelsPlays.toLocaleString(),
            tactics: instagramTactics  // OLD FORMAT - for compatibility
          },
          {
            platform: "spotify",
            budget: metrics.spotify.budget,
            streams: metrics.spotify.streams.toLocaleString(),
            playlistPlacements: "15-25 playlists",
            tactics: spotifyTactics  // OLD FORMAT - for compatibility
          }
        ],
        
        content: {
          captions: [
            `🔥 New ${genre} alert! "${trackTitle}" by ${artistName} - AI pushing this 24/7! 🎵`,
            `🤖 When ${artistName} drops "${trackTitle}", Sparkam's AI gets to work: 90 videos, 150 pitches, 24/7 monitoring! 🚀`,
            `AI + ${genre} = 🔥 "${trackTitle}" by ${artistName} is getting the full autonomous treatment! 🌊`
          ],
          hashtags: [`#${genre}`, "#NewMusic", `#${artistName.replace(/\s+/g,'')}`, "#AIPromo", "#SparkamAI"]
        }
      };
    }
    
    campaign.id = `camp_${Date.now()}`;
    campaign.created = new Date().toISOString();
    campaign.track = { dspLink, artistName, trackTitle, genre };
    campaign.budget = budgetNum;
    
    // Zapier webhook
    if (process.env.ZAPIER_WEBHOOK_URL) {
      try {
        await fetch(process.env.ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artistName, trackTitle, genre, budget: budgetNum,
            estimatedStreams: campaign.metrics.estimatedStreams,
            totalReach: campaign.metrics.totalReach,
            roi: campaign.metrics.roi,
            timestamp: new Date().toISOString(),
            campaignId: campaign.id,
            fullCampaign: JSON.stringify(campaign)
          })
        });
      } catch (err) {
        console.warn('Zapier failed:', err.message);
      }
    }
    
    return res.status(200).json({
      success: true,
      campaign: campaign,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: '500', message: error.message }
    });
  }
};
  
