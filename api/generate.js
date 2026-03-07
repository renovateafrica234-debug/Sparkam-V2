// api/generate-campaign.js (DEMO VERSION - Works without Claude API)

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
    
    // DEMO MODE: Return pre-generated campaign
    // This lets artists see what they'll get while you set up Claude API
    
    const demoCampaign = {
      campaign_overview: `Professional 30-day marketing campaign for "${trackTitle}" by ${artistName}. This ${genre} release will reach 50,000+ people through strategic TikTok, Instagram, and Spotify promotion with a ₦${budget.toLocaleString()} budget.`,
      
      tiktok_strategy: {
        daily_posting_schedule: "Post 3 times daily at 9AM, 3PM, and 9PM WAT for maximum Nigerian audience engagement",
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
          "Street performance: Guerrilla promo",
          "Q&A: Answer fan questions about the song",
          "Playlist adds: Show Spotify growth",
          "Producer spotlight: Tag your producer",
          "Green screen: Fans can duet",
          "Motivation: How the song inspires you",
          "Acoustic version: Raw vocals",
          "Remix challenge: Encourage covers",
          "Timeline: This day vs that day",
          "Reaction videos: React to fan covers",
          "Studio secrets: Production tips",
          "Countdown: 3 days to release",
          "Release day: Thank you video",
          "Post-release: Stream count updates",
          "Influencer shoutouts: Tag supporters",
          "Chart positions: Celebrate milestones",
          "Fan meet-up: Announce listening party",
          "Music video teaser: Visual snippets",
          "Live performance: Concert clips",
          "Awards submission: Announce nominations",
          "Year-end recap: Journey summary"
        ],
        hashtag_strategy: ["#" + genre, "#NigerianMusic", "#Afrobeats", "#NewMusicAlert", "#" + artistName, "#" + trackTitle.replace(/\s/g, ''), "#LagosMusicScene", "#NaijaMusic", "#AfricanMusic", "#IndependentArtist"],
        best_posting_times: "Peak: 9AM, 3PM, 9PM WAT. Avoid 12-2PM (lunch hour low engagement)"
      },
      
      instagram_strategy: {
        content_mix: "70% Reels, 20% Stories, 10% Feed posts. Focus on Reels for discovery.",
        reels_concepts: [
          "Track premiere: Full audio with lyrics",
          "Making-of montage: Studio sessions",
          "Outfit inspiration: Fashion tied to song vibe",
          "Fan testimonials: Share DMs and comments",
          "Lyrics reel: Animated text over visuals",
          "Collaboration announcement: Feature artists",
          "Release party: Event highlights",
          "Playlist feature: Show adds",
          "Radio play: Studio visit clips",
          "Press coverage: Media mentions",
          "Performance clips: Live show energy",
          "Acoustic session: Intimate version",
          "Day 1 vs Now: Artist growth journey",
          "Stream milestones: Celebrate numbers",
          "Behind the lyrics: Song meaning",
          "Dance tutorial: Signature moves",
          "Cover challenge: Encourage fans",
          "Music video BTS: Production moments",
          "Chart update: Trending positions",
          "Thank you reel: Appreciate supporters",
          "Next single tease: Build anticipation"
        ],
        story_ideas: ["Polls: Best lyric?", "Quizzes: Song trivia", "Countdowns: Release date", "Q&A: Ask me anything", "DM screenshots: Fan love"],
        engagement_tactics: "Reply to every comment in first hour. Run weekly giveaways. Collaborate with micro-influencers (10-50K followers)."
      },
      
      spotify_strategy: {
        playlist_pitching: "Submit to editorial playlists 3 weeks before release. Target independent curators with similar artists in their playlists.",
        target_playlists: [
          "Afrobeats Official", "New Music Friday Nigeria", "Naija Hotlist", "Lagos Vibes",
          "African Heat", "Afropop Essentials", "Fresh Finds: Africa", "Alté Cruise",
          "Nigerian Indie", "Afro Rising", "Gbedu Central", "Afro Fire", "Lagos to Accra",
          "African Giants", "Afrobeats BBQ", "Naija Spirit", "West African Sounds",
          "Afro Workday", "African Party Playlist", "Afrobeat Workout"
        ],
        curator_outreach_template: `Hi [Curator Name],\n\nI'm ${artistName}, and I've been following your playlist. I recently released "${trackTitle}" - a ${genre} track that I think fits perfectly with your vibe.\n\nIt's getting great traction (X streams in first week) and fans are loving it.\n\nWould you consider adding it? Happy to support by sharing the playlist!\n\nBest,\n${artistName}`
      },
      
      influencer_strategy: {
        target_influencers: [
          "@lagosinfluencer1 (50K followers - Lifestyle)",
          "@naijamusichub (80K - Music)",
          "@afrobeatsdancer (120K - Dance)",
          "@lagosfashion (45K - Fashion)",
          "@naijayouths (200K - Entertainment)",
          "@abujaparties (60K - Events)",
          "@streetstylelagos (35K - Street culture)"
        ],
        outreach_approach: "DM with personalized message. Offer collaboration (not just promo). Build relationships before asking.",
        collaboration_ideas: ["TikTok duet challenges", "Instagram Live sessions", "Behind-the-scenes content swaps", "Playlist exchange"]
      },
      
      budget_breakdown: {
        tiktok_ads: `₦${Math.floor(budget * 0.25).toLocaleString()} (25%)`,
        instagram_ads: `₦${Math.floor(budget * 0.25).toLocaleString()} (25%)`,
        influencer_collaborations: `₦${Math.floor(budget * 0.30).toLocaleString()} (30%)`,
        playlist_pitching: `₦${Math.floor(budget * 0.10).toLocaleString()} (10%)`,
        content_creation: `₦${Math.floor(budget * 0.10).toLocaleString()} (10%)`
      },
      
      week_by_week_plan: {
        week_1: "Pre-release hype: Teasers, countdown, influencer seeding. Build anticipation.",
        week_2: "RELEASE WEEK: Heavy posting, paid ads launch, playlist pitching intensifies.",
        week_3: "Sustain momentum: User-generated content, reaction videos, performance clips.",
        week_4: "Long-tail strategy: Retarget engaged users, optimize top-performing content, plan next release."
      },
      
      kpis_and_metrics: {
        target_streams: `${Math.floor(budget / 100)} streams (based on ₦${budget.toLocaleString()} budget)`,
        target_followers: `+${Math.floor(budget / 500)} followers across platforms`,
        target_engagement_rate: "5-8% on organic posts, 2-4% on paid ads"
      }
    };
    
    // Simulate AI processing delay (makes it feel real)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return res.status(200).json({
      success: true,
      campaign: {
        artistName,
        trackTitle,
        genre,
        budget,
        strategy: demoCampaign,
        createdAt: new Date().toISOString(),
        demo: true
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
