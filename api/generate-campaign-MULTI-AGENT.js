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
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Groq API key not configured' 
      });
    }
    
    // AGENT 1: Market Research & Competitor Analysis
    const researchPrompt = `You are a Nigerian music industry analyst. Research and provide:

For ${genre} artists like ${artistName} releasing "${trackTitle}":
1. Top 5 similar successful artists in Nigeria (with specific names)
2. What worked in their recent campaigns (specific tactics)
3. Current trending sounds/vibes in ${genre}
4. Average stream numbers for this genre in Nigeria
5. Typical budget allocation that works

Be SPECIFIC. Real names, real numbers, real tactics.`;

    const research = await callGroq(researchPrompt, 1500);
    
    // AGENT 2: TikTok Strategy Specialist
    const tiktokPrompt = `You are a Nigerian TikTok marketing expert. Based on this research:
${research}

Create 30 SPECIFIC TikTok video concepts for ${artistName} - "${trackTitle}" (${genre}).

Each concept should include:
- Exact hook/opening line
- Visual direction
- Call-to-action
- Hashtag combo
- Best posting time

Make them viral-worthy and culturally relevant to Nigerian youth. Be creative and specific.`;

    const tiktokStrategy = await callGroq(tiktokPrompt, 2000);
    
    // AGENT 3: Instagram & Playlist Strategy
    const instagramPlaylistPrompt = `Based on:
${research}

Create for ${artistName} - "${trackTitle}":

1. 21 Instagram Reels concepts (SPECIFIC, not generic)
2. 20 REAL Spotify playlists in Nigeria/Africa that accept ${genre}
   - Include estimated follower counts
   - Curator contact methods (if public)
   - Submission approach for each

3. 15 REAL Nigerian music influencers/bloggers
   - Instagram handles
   - Follower counts
   - Engagement rates
   - Why they're good for this campaign

Be specific with real names and handles.`;

    const igPlaylistStrategy = await callGroq(instagramPlaylistPrompt, 2000);
    
    // AGENT 4: ROI Calculator & Budget Optimizer
    const roiPrompt = `You are a music marketing ROI specialist. Based on:
Budget: ₦${budget.toLocaleString()}
Genre: ${genre}
Nigerian market data

Calculate realistic projections:

1. Budget breakdown with EXPECTED RETURNS:
   - TikTok ads: ₦X → Expected reach: Y views, Z new followers
   - Instagram ads: ₦X → Expected reach: Y impressions, Z engagement
   - Influencer collabs: ₦X → Expected reach: Y views, Z conversions
   - Playlist pitching: ₦X → Expected: Y playlist adds, Z streams
   - Content creation: ₦X → Expected: Y pieces of content

2. 30-day projections:
   - Week 1 expected streams: X
   - Week 2 expected streams: X
   - Week 3 expected streams: X
   - Week 4 expected streams: X
   - Total expected: X streams, Y new followers, Z% engagement increase

3. ROI calculation:
   - Investment: ₦${budget.toLocaleString()}
   - Expected streaming revenue: ₦X
   - Expected follower value: ₦X
   - Expected brand value increase: ₦X
   - Total expected ROI: X%

Be realistic but optimistic based on Nigerian market data.`;

    const roiData = await callGroq(roiPrompt, 1500);
    
    // AGENT 5: Executive Summary & Action Plan
    const summaryPrompt = `You are a campaign strategist. Synthesize ALL this data into a compelling executive summary:

Research: ${research.substring(0, 500)}
TikTok: ${tiktokStrategy.substring(0, 500)}
Instagram/Playlists: ${igPlaylistStrategy.substring(0, 500)}
ROI: ${roiData.substring(0, 500)}

Create:
1. Compelling campaign overview (make them excited!)
2. Week-by-week action plan (SPECIFIC dates and tasks)
3. Key success factors (what will make or break this)
4. Risk mitigation strategies
5. Quick wins (what to do in first 48 hours)

Make it actionable and inspiring!`;

    const summary = await callGroq(summaryPrompt, 1500);
    
    // COMPILE EVERYTHING
    const fullCampaign = {
      campaign_overview: summary,
      market_research: research,
      tiktok_strategy: tiktokStrategy,
      instagram_playlist_strategy: igPlaylistStrategy,
      roi_projections: roiData,
      
      budget_breakdown: {
        total: `₦${budget.toLocaleString()}`,
        tiktok_ads: `₦${Math.floor(budget * 0.25).toLocaleString()}`,
        instagram_ads: `₦${Math.floor(budget * 0.20).toLocaleString()}`,
        influencer_collabs: `₦${Math.floor(budget * 0.30).toLocaleString()}`,
        playlist_pitching: `₦${Math.floor(budget * 0.15).toLocaleString()}`,
        content_creation: `₦${Math.floor(budget * 0.10).toLocaleString()}`
      },
      
      expected_results: {
        streams_30_days: Math.floor(budget / 15),
        new_followers: Math.floor(budget / 75),
        engagement_increase: '150-300%',
        playlist_adds: '8-15 playlists',
        roi_percentage: '200-400%'
      }
    };
    
    return res.status(200).json({
      success: true,
      campaign: {
        artistName,
        trackTitle,
        genre,
        budget,
        strategy: fullCampaign,
        createdAt: new Date().toISOString(),
        ai_model: '5-Agent Groq System (Llama 3.3 70B)',
        generation_time: '8-12 seconds'
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate campaign'
    });
  }
};

// Helper function for Groq API calls
async function callGroq(prompt, maxTokens = 1500) {
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
          content: 'You are a Nigerian music industry expert. Be specific, detailed, and realistic. Use real names, real numbers, and actionable advice.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: maxTokens
    })
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Groq API error');
  
  return data.choices[0].message.content;
          }
                       
