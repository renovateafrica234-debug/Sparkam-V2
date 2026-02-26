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

// Realistic metrics calculator
function calculateMetrics(budget) {
  const streams = Math.floor(budget * 0.1);
  const reach = Math.floor(budget * 2);
  const engagement = "3-5%";
  const roi = Math.floor(budget * 1.8);
  
  return { 
    streams, 
    reach, 
    engagement, 
    roi,
    // Platform breakdowns
    tiktok: {
      budget: Math.floor(budget * 0.4),
      reach: Math.floor(reach * 0.45),
      views: Math.floor(budget * 1.2),
      engagement: "4-6%"
    },
    instagram: {
      budget: Math.floor(budget * 0.35),
      reach: Math.floor(reach * 0.35),
      reelsPlays: Math.floor(budget * 0.8),
      engagement: "3-4%"
    },
    spotify: {
      budget: Math.floor(budget * 0.25),
      streams: Math.floor(streams * 0.6),
      playlistReach: Math.floor(reach * 0.2)
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
    
    // Enhanced prompt for AI
    const prompt = `Create an AUTONOMOUS AI campaign for "${trackTitle}" by ${artistName} (${genre}).
Budget: ₦${budgetNum}

Show the MAGIC of AI autonomy with:
- Specific daily actions AI will take
- Real-time optimization triggers
- Week-by-week execution plan
- Exact metrics per platform

Return valid JSON:
{
  "overview": "Brief autonomous AI campaign description with realistic numbers",
  "metrics": ${JSON.stringify(metrics)},
  "platforms": [
    {
      "platform": "tiktok",
      "budget": ${metrics.tiktok.budget},
      "projections": {
        "reach": "${metrics.tiktok.reach.toLocaleString()}",
        "videoViews": "${metrics.tiktok.views.toLocaleString()}",
        "engagement": "${metrics.tiktok.engagement}"
      },
      "automation": [
        "Day 1-30: AI creates 3 viral-style videos daily (9AM, 3PM, 9PM WAT)",
        "Hour 1: AI identifies 30 trending ${genre} challenges and sounds",
        "Daily: AI pitches to 5 micro-influencers (10K-100K followers) with personalized messages",
        "Real-time: If video hits 1K views in 2 hours, AI boosts with ₦500 spend"
      ]
    }
  ],
  "timeline": {
    "week1": "AI launches TikTok campaign, pitches 20 influencers, monitors hourly",
    "week2": "Instagram Reels rollout, engagement automation activated",
    "week3": "Spotify pitching begins, pre-save campaign launches",
    "week4": "AI optimization phase - reallocates budget to top-performing platform"
  },
  "aiOptimization": [
    "If TikTok engagement < 2% by Day 3 → Shift ₦2K to Instagram",
    "If influencer opens in 24hrs → AI sends follow-up",
    "If playlist curator doesn't respond in 48hrs → AI tries next curator",
    "If video goes viral (10K+ views) → AI allocates extra ₦1K for promotion"
  ]
}`;

    let campaign = null;
    
    if (model && process.env.GOOGLE_API_KEY) {
      try {
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
    
    // MAGIC FALLBACK - Shows the real autonomous power
    if (!campaign) {
      campaign = {
        overview: `Autonomous AI campaign for "${trackTitle}" by ${artistName}. Sparkam's AI executes a 360° ${genre} strategy 24/7 across TikTok, Instagram, and Spotify, projecting ${metrics.streams.toLocaleString()}+ streams and ${metrics.reach.toLocaleString()}+ reach over 30 days—completely hands-off.`,
        
        metrics: {
          estimatedStreams: metrics.streams,
          totalReach: metrics.reach,
          engagementRate: metrics.engagement,
          roi: metrics.roi.toLocaleString(),
          costComparison: `Hiring a marketing manager: ₦${(budgetNum * 3).toLocaleString()}/month. Sparkam AI: ₦${budgetNum.toLocaleString()} one-time.`
        },
        
        platforms: [
          {
            platform: "TikTok",
            budget: metrics.tiktok.budget,
            projections: {
              reach: metrics.tiktok.reach.toLocaleString() + "+",
              videoViews: metrics.tiktok.views.toLocaleString() + "+",
              engagement: metrics.tiktok.engagement,
              viralPotential: "15-20% chance of 100K+ views"
            },
            automation: [
              `🤖 Day 1-30: AI creates 90 videos total (3 daily at 9AM, 3PM, 9PM WAT) using "${trackTitle}" audio`,
              `🤖 Hour 1: AI scans 100+ trending ${genre} hashtags and sounds, selects top 10 for integration`,
              `🤖 Daily 10AM: AI pitches 5 micro-influencers (10K-100K followers) with personalized DMs`,
              `🤖 Real-time: If video hits 500 views in 1 hour → AI boosts with ₦300`,
              `🤖 Real-time: If engagement drops below 3% → AI tests new hashtag strategy within 2 hours`
            ],
            intelligentPivots: [
              "🧠 If influencer responds → AI sends collaboration brief automatically",
              "🧠 If video underperforms → AI analyzes and adjusts creative style next video",
              "🧠 If trend dies → AI switches to new trend within hours"
            ]
          },
          {
            platform: "Instagram",
            budget: metrics.instagram.budget,
            projections: {
              reach: metrics.instagram.reach.toLocaleString() + "+",
              reelsPlays: metrics.instagram.reelsPlays.toLocaleString() + "+",
              engagement: metrics.instagram.engagement,
              storyViews: Math.floor(metrics.instagram.reach * 0.4).toLocaleString() + "+"
            },
            automation: [
              "🤖 AI schedules 21 Reels + 30 Stories over 30 days (optimized posting times)",
              `🤖 Daily: AI engages with 50 ${genre} fan accounts (likes, comments, strategic follows)`,
              `🤖 Weekly: AI coordinates takeovers with 2-3 ${genre} fan pages (20K+ followers each)`,
              "🤖 AI generates carousel posts using track lyrics + artist journey highlights",
              "🤖 Real-time: AI responds to DMs from engaged followers within 10 minutes"
            ],
            intelligentPivots: [
              "🧠 If Reels outperform Stories → AI shifts 70% content to Reels",
              "🧠 If fan page partnership succeeds → AI contacts similar pages",
              "🧠 If carousel posts get high saves → AI creates more educational content"
            ]
          },
          {
            platform: "Spotify",
            budget: metrics.spotify.budget,
            projections: {
              streams: metrics.spotify.streams.toLocaleString() + "+",
              playlistPlacements: "15-25 playlists",
              playlistReach: metrics.spotify.playlistReach.toLocaleString() + "+",
              saveRate: "5-8%"
            },
            automation: [
              `🤖 Hour 1: AI generates personalized pitches for 50 ${genre} playlist curators`,
              "🤖 Day 1-7: AI sends pitches in waves (10/day), tracks open rates",
              "🤖 AI creates Canvas video using track artwork + animated ${genre} visuals",
              "🤖 AI launches pre-save campaign with 3 email sequences over 2 weeks",
              "🤖 Real-time: If curator opens email → AI sends follow-up with streaming stats"
            ],
            intelligentPivots: [
              "🧠 If curator doesn't respond in 48hrs → AI tries next 10 curators",
              "🧠 If playlist accepts track → AI monitors add date and promotes via socials",
              "🧠 If pre-save rate > 10% → AI increases ad spend by ₦1K"
            ]
          }
        ],
        
        timeline: {
          day1: "🚀 AI analyzes track, sets up automation, sends first 10 playlist pitches",
          day3: "📊 First performance check - AI adjusts strategy based on early data",
          week1: "🎥 30 TikTok videos created, 20 influencers contacted, Instagram content calendar live",
          week2: "📱 Instagram engagement automation running, Spotify pitches in full swing",
          week3: "🎵 First playlist placements expected, AI optimizes top-performing content",
          week4: "📈 AI reallocates budget to highest ROI platform, final optimization push"
        },
        
        aiIntelligence: {
          monitoring: "AI checks metrics every 2 hours, 24/7 for 30 days",
          optimization: "AI makes 50-100 micro-adjustments over campaign lifetime",
          budgetFlexibility: [
            "If TikTok gets 5%+ engagement → AI moves extra ₦2K from other platforms",
            "If Instagram Stories outperform Reels → AI shifts content strategy in 24hrs",
            "If Spotify playlists aren't responding → AI pivots to influencer playlist strategy",
            "If any platform goes viral → AI immediately allocates ₦1-2K for amplification"
          ],
          learningCurve: "AI learns from your campaign and improves strategy daily"
        },
        
        humanVsAi: {
          title: "Why AI Beats Manual Marketing",
          comparison: [
            {
              task: "Content Creation",
              human: "1-2 posts/day max, needs breaks",
              ai: "90 videos in 30 days, never sleeps"
            },
            {
              task: "Influencer Outreach",
              human: "10-20 DMs/day, inconsistent",
              ai: "150 personalized pitches with instant follow-ups"
            },
            {
              task: "Performance Monitoring",
              human: "Check 2-3x daily, miss trends",
              ai: "Every 2 hours for 30 days, catches viral moments"
            },
            {
              task: "Budget Optimization",
              human: "Weekly reviews, slow pivots",
              ai: "Real-time allocation, instant pivots"
            },
            {
              task: "Cost",
              human: `₦${(budgetNum * 3).toLocaleString()}-${(budgetNum * 5).toLocaleString()}/month + delays`,
              ai: `₦${budgetNum.toLocaleString()} one-time, starts immediately`
            }
          ]
        },
        
        content: {
          captions: [
            `🔥 New ${genre} alert! "${trackTitle}" by ${artistName} - Our AI is pushing this 24/7 across every platform! 🎵`,
            `🤖 When ${artistName} drops "${trackTitle}", Sparkam's AI gets to work: 90 videos, 150 pitches, 24/7 monitoring. This is autonomous promotion! 🚀`,
            `AI + ${genre} = 🔥 "${trackTitle}" by ${artistName} is getting the full autonomous treatment. Watch it grow! 🌊`
          ],
          hashtags: [`#${genre}`, "#NewMusic", `#${artistName.replace(/\s+/g,'')}`, "#AIPromo", "#SparkamAI", "#AutonomousMarketing"],
          schedule: "AI posts at optimal times: 9AM (commute), 3PM (lunch break), 9PM (evening scroll)"
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
      
