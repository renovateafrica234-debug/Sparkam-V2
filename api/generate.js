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
    
    const demoCampaign = {
      campaign_overview: `Professional 30-day marketing campaign for "${trackTitle}" by ${artistName}. This ${genre} release will reach 50,000+ people through strategic TikTok, Instagram, and Spotify promotion with a ₦${budget.toLocaleString()} budget.`,
      
      tiktok_strategy: {
        daily_posting_schedule: "Post 3 times daily at 9AM, 3PM, and 9PM WAT",
        video_concepts: [
          "Behind-the-scenes: Recording session vibes",
          "Lyrics breakdown: Explain the meaning",
          "Dance challenge: Create viral choreography",
          "Day in the life: Studio to street",
          "Fan reactions: Showcase early listeners",
          "Snippet: 15-second hook with captions",
          "Throwback: Your journey to this moment",
          "Collaboration tease: Tag potential features",
          "Fashion showcase: Your style + the track",
          "Street performance: Guerrilla promo"
        ],
        hashtag_strategy: ["#" + genre, "#NigerianMusic", "#Afrobeats"],
        best_posting_times: "Peak: 9AM, 3PM, 9PM WAT"
      },
      
      instagram_strategy: {
        content_mix: "70% Reels, 20% Stories, 10% Feed posts",
        reels_concepts: ["Track premiere", "Making-of montage", "Fan testimonials"],
        engagement_tactics: "Reply to every comment in first hour"
      },
      
      spotify_strategy: {
        playlist_pitching: "Submit to editorial playlists 3 weeks before release",
        target_playlists: ["Afrobeats Official", "New Music Friday Nigeria", "Naija Hotlist"]
      },
      
      budget_breakdown: {
        tiktok_ads: `₦${Math.floor(budget * 0.25).toLocaleString()} (25%)`,
        instagram_ads: `₦${Math.floor(budget * 0.25).toLocaleString()} (25%)`,
        influencer_collaborations: `₦${Math.floor(budget * 0.30).toLocaleString()} (30%)`,
        playlist_pitching: `₦${Math.floor(budget * 0.10).toLocaleString()} (10%)`,
        content_creation: `₦${Math.floor(budget * 0.10).toLocaleString()} (10%)`
      }
    };
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return res.status(200).json({
      success: true,
      campaign: {
        artistName,
        trackTitle,
        genre,
        budget,
        strategy: demoCampaign,
        createdAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
