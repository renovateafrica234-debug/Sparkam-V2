module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }
  
  try {
    const { artistName, trackTitle, genre, budget } = req.body;
    
    // Validate input
    if (!artistName || !trackTitle || !genre || !budget) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: artistName, trackTitle, genre, budget' 
      });
    }
    
    // Check API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'GROQ_API_KEY not configured in environment variables' 
      });
    }
    
    // Currency detection
    const currency = budget < 1000 ? '$' : '₦';
    
    console.log(`[Campaign] Generating for ${artistName} - ${trackTitle} (${currency}${budget})`);
    
    // Simple campaign prompt (faster, more reliable)
    const prompt = `Create a detailed 30-day music marketing campaign for:

Artist: ${artistName}
Track: ${trackTitle}
Genre: ${genre}
Budget: ${currency}${budget.toLocaleString()}

Generate a comprehensive strategy with:

1. BUDGET BREAKDOWN (specific amounts):
   - Content Creation
   - Social Media Ads
   - Influencer Collaborations
   - Playlist Pitching
   - Community Building

2. EXPECTED RESULTS (30 days):
   - Streams target
   - New followers target
   - Playlist adds
   - ROI percentage

3. STRATEGY SECTIONS:
   - Market Research (similar successful artists)
   - TikTok/YouTube Strategy (specific video ideas)
   - Instagram Strategy (Reels concepts)
   - Playlist Strategy (real playlist names to target)
   - Influencer Strategy (realistic micro-influencers)
   - Week-by-Week Action Plan

Be SPECIFIC with real examples, realistic numbers, and actionable advice for independent artists.`;

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a global music marketing expert. Create detailed, actionable campaigns for independent artists. Be specific with real examples and realistic projections.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });
    
    // Check response
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Campaign] Groq API error:', errorData);
      return res.status(500).json({
        success: false,
        error: `Groq API error: ${errorData.error?.message || 'Unknown error'}`
      });
    }
    
    const data = await response.json();
    const campaignText = data.choices[0].message.content;
    
    console.log(`[Campaign] Generated ${campaignText.length} characters`);
    
    // Parse campaign into sections
    const campaign = {
      campaign_type: 'Independent Artist Campaign',
      campaign_text: campaignText,
      
      budget_breakdown: {
        total: `${currency}${budget.toLocaleString()}`,
        content_creation: `${currency}${Math.floor(budget * 0.20).toLocaleString()}`,
        social_ads: `${currency}${Math.floor(budget * 0.25).toLocaleString()}`,
        influencers: `${currency}${Math.floor(budget * 0.30).toLocaleString()}`,
        playlists: `${currency}${Math.floor(budget * 0.15).toLocaleString()}`,
        community: `${currency}${Math.floor(budget * 0.10).toLocaleString()}`
      },
      
      realistic_expectations: {
        streams_30_days: `${Math.floor(budget * 0.04)}-${Math.floor(budget * 0.10)}`,
        new_followers: `${Math.floor(budget * 0.007)}-${Math.floor(budget * 0.025)}`,
        playlist_adds: '8-15 indie playlists',
        roi_percentage: '90-220%'
      }
    };
    
    // Return success
    return res.status(200).json({
      success: true,
      campaign: {
        artistName,
        trackTitle,
        genre,
        budget,
        currency,
        strategy: campaign,
        createdAt: new Date().toISOString(),
        ai_model: 'Groq Llama 3.3 70B'
      }
    });
    
  } catch (error) {
    console.error('[Campaign] Error:', error);
    return res.status(500).json({
      success: false,
      error: `Server error: ${error.message}`
    });
  }
};
      
