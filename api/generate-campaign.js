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
    
    // Determine currency/region from budget (rough estimate)
    const currency = budget < 1000 ? '$' : '₦';
    const isWestAfrica = currency === '₦';
    
    // AGENT 1: Indie Market Research
    const researchPrompt = `You are a global independent music marketing expert. For INDEPENDENT artists (NOT mainstream celebrities).

For ${genre} indie artist ${artistName} releasing "${trackTitle}" with ${currency}${budget.toLocaleString()} budget:

1. Identify 5 SUCCESSFUL INDEPENDENT ${genre} artists globally (emerging, not mainstream stars)
   - Must be indie/emerging artists who succeeded recently
   - Include artists from various regions (US, UK, Africa, Latin America, Asia)
   
2. What AFFORDABLE tactics worked for them
   - Focus on organic growth strategies
   - Budget-friendly collaborations
   - Grassroots marketing
   
3. Current global indie ${genre} trends
4. Realistic stream numbers for indie artists (1K-50K range)
5. Budget allocation that works for ${currency}${budget.toLocaleString()}

Be REALISTIC for independent artists, not mainstream stars.`;

    const research = await callGroq(researchPrompt, 1500);
    
    // AGENT 2: Micro-Influencer Strategy (Global)
    const influencerPrompt = `Based on ${currency}${budget.toLocaleString()} budget for indie artist ${artistName}:

Find 15 AFFORDABLE music influencers/content creators GLOBALLY:

TIER 1 (Low Cost): 5K-20K followers
- Handle/Name
- Platform (TikTok, Instagram, YouTube)
- Follower count
- Niche (${genre}, indie music, music discovery)
- Region (US, UK, Africa, Latin America, Asia - be specific)
- Why they're good for indie artists
- Estimated cost range

TIER 2 (Medium Cost): 20K-50K followers
- Same details

TIER 3 (Higher Cost): 50K-150K followers
- Same details

Focus on:
- Music bloggers (Pitchfork, NME, regional blogs)
- Playlist curators (Spotify, Apple Music, SoundCloud)
- YouTube music channels
- TikTok music creators
- Instagram music pages
- Twitter/X music influencers

NO mainstream celebrities. Only AFFORDABLE influencers indie artists can actually work with across different regions.`;

    const influencerStrategy = await callGroq(influencerPrompt, 2000);
    
    // AGENT 3: Platform Strategy (TikTok, Instagram, YouTube)
    const contentPrompt = `For indie artist ${artistName} - "${trackTitle}" (${currency}${budget.toLocaleString()} budget):

Create comprehensive content strategy:

TikTok (30 video concepts):
- Phone camera content (no expensive productions)
- Trending sounds/challenges adaptation
- Behind-the-scenes authentic moments
- Fan engagement tactics
- Creative challenges that cost nothing
- Best posting times (global reach)

Instagram (15 Reels + 10 Stories):
- Grassroots content ideas
- Engagement tactics
- Story features
- Collaboration ideas

YouTube Shorts (10 concepts):
- Music discovery tactics
- Cross-platform strategy

Each concept should include:
- Hook/opening
- Where to shoot (accessible locations)
- What you need (phone, basic equipment)
- Call-to-action
- Hashtag strategy
- Expected organic reach

Make it ACTIONABLE for artists with minimal production budget globally.`;

    const contentStrategy = await callGroq(contentPrompt, 2500);
    
    // AGENT 4: Playlist Strategy (Global Platforms)
    const playlistPrompt = `For ${genre} indie artist ${artistName}:

Find 20 playlists across platforms that:
1. Accept submissions from indie artists
2. Focus on ${genre}/indie music
3. Have 500-50K followers (realistic range)
4. Actually respond to indie artists

Platforms to cover:
- Spotify (independent curators)
- Apple Music
- YouTube Music
- SoundCloud
- Deezer

For each playlist:
- Name
- Platform
- Follower count
- Curator (if known)
- Submission method (SubmitHub, Playlist Push, email, DM)
- Cost (if any): Prioritize FREE options
- Success rate for indie artists
- Expected streams if added

Include playlists from:
- USA (indie, college radio, regional)
- UK (underground, BBC Introducing style)
- Europe (France, Germany, Netherlands)
- Latin America (if ${genre} fits)
- Africa (if ${genre} fits)
- Asia (Japan, Korea, India - if ${genre} fits)

NO official platform playlists (impossible for indies). Focus on curator-run, independent playlists.`;

    const playlistStrategy = await callGroq(playlistPrompt, 2000);
    
    // AGENT 5: Realistic ROI Calculator (Currency-Aware)
    const roiPrompt = `Calculate REALISTIC projections for indie artist with ${currency}${budget.toLocaleString()}:

Budget Breakdown with INDIE-LEVEL RETURNS:
1. Micro-influencer collabs (${Math.floor(budget * 0.27)}): 
   - 8-12 posts from affordable influencers globally
   - Expected reach: 50K-150K impressions
   - Expected conversions: 500-2,000 new listeners

2. TikTok organic + boost (${Math.floor(budget * 0.17)}):
   - 30 organic videos
   - Small ad boost for top performers
   - Expected: 200K-500K views, 1K-4K profile visits

3. Instagram + YouTube (${Math.floor(budget * 0.13)}):
   - Daily content + Story/Shorts
   - Expected: 50K-150K reach, 500-2,000 new followers

4. Playlist pitching (${Math.floor(budget * 0.10)}):
   - SubmitHub, Playlist Push credits
   - Direct curator outreach
   - Expected: 8-15 playlist adds, 3K-12K monthly streams

5. Content creation (${Math.floor(budget * 0.20)}):
   - Equipment, editing software
   - Collaborations
   - Expected: 50+ pieces of content

6. Miscellaneous (${Math.floor(budget * 0.13)}):
   - Graphics, promotional materials
   - Community building

30-Day REALISTIC Projections:
- Week 1: 400-1,000 streams
- Week 2: 1,000-2,500 streams
- Week 3: 2,000-4,500 streams
- Week 4: 2,500-6,000 streams
- TOTAL: 5,900-14,000 streams

New Followers: 1,000-3,500
Engagement Rate Increase: 120-280%
Playlist Adds: 8-15 playlists
Social Media Reach: 200K-600K impressions

ROI (Indie Realistic):
- Streaming revenue: ${currency}${Math.floor(budget * 0.03)}-${currency}${Math.floor(budget * 0.08)}
- New fan lifetime value: ${currency}${Math.floor(budget * 0.4)}-${currency}${Math.floor(budget * 1.2)}
- Brand growth: Measurable momentum for emerging artist
- Total ROI: 90-220% (realistic for first 30-day campaign)

BE REALISTIC. These are achievable numbers for indie artists with proper execution.`;

    const roiData = await callGroq(roiPrompt, 1800);
    
    // AGENT 6: Action Plan
    const actionPrompt = `Create DETAILED week-by-week action plan for ${artistName}:

Week 1 (Pre-Release Strategy):
- Day-by-day specific tasks
- Platform setup optimization
- Content calendar creation
- Influencer outreach timing

Week 2 (Release Week):
- Hour-by-hour first 48 hours
- Platform-specific posting schedule
- Community engagement tactics
- Quick response protocols

Week 3-4 (Momentum Sustaining):
- Daily engagement activities
- Content recycling strategies
- Playlist follow-ups
- Performance analysis

Include:
- First 24 hours critical actions
- Low-cost/free growth hacks
- Global best posting times (consider time zones)
- Community building for long-term growth

Make it ACTIONABLE for someone with limited team, working globally with online tools.`;

    const actionPlan = await callGroq(actionPrompt, 1800);
    
    // COMPILE GLOBAL INDIE-FOCUSED CAMPAIGN
    const fullCampaign = {
      campaign_type: 'Global Independent Artist Campaign',
      target_market: 'Worldwide Independent Music Scene',
      budget_tier: budget < 30000 ? 'Grassroots' : budget < 80000 ? 'Emerging' : 'Established Indie',
      
      market_research: research,
      influencer_strategy: influencerStrategy,
      content_strategy: contentStrategy,
      playlist_strategy: playlistStrategy,
      roi_projections: roiData,
      action_plan: actionPlan,
      
      budget_breakdown: {
        total: `${currency}${budget.toLocaleString()}`,
        micro_influencers: `${currency}${Math.floor(budget * 0.27).toLocaleString()} (27%)`,
        tiktok_youtube_shorts: `${currency}${Math.floor(budget * 0.17).toLocaleString()} (17%)`,
        instagram_content: `${currency}${Math.floor(budget * 0.13).toLocaleString()} (13%)`,
        playlist_pitching: `${currency}${Math.floor(budget * 0.10).toLocaleString()} (10%)`,
        content_creation: `${currency}${Math.floor(budget * 0.20).toLocaleString()} (20%)`,
        community_misc: `${currency}${Math.floor(budget * 0.13).toLocaleString()} (13%)`
      },
      
      realistic_expectations: {
        streams_30_days: `${Math.floor(budget * 0.04)}-${Math.floor(budget * 0.10)}`,
        new_followers: `${Math.floor(budget * 0.007)}-${Math.floor(budget * 0.025)}`,
        engagement_increase: '120-280%',
        playlist_adds: '8-15 indie playlists',
        influencer_posts: '8-15 posts globally',
        social_reach: '200K-600K impressions',
        roi_percentage: '90-220% (first campaign)'
      },
      
      global_best_practices: [
        'Results compound over time - consistency is key',
        'Build genuine global fanbase, not just vanity metrics',
        'Engage across time zones for maximum reach',
        'Leverage regional trends while maintaining authenticity',
        'Success for indies = 6K-15K streams in first 30 days globally'
      ]
    };
    
    return res.status(200).json({
      success: true,
      campaign: {
        artistName,
        trackTitle,
        genre,
        budget,
        currency,
        strategy: fullCampaign,
        createdAt: new Date().toISOString(),
        ai_model: '6-Agent Global Indie System (Llama 3.3 70B)',
        campaign_focus: 'Global Independent Artist Growth'
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
          content: 'You are a global independent music marketing expert. Focus on AFFORDABLE, REALISTIC strategies for independent artists worldwide with limited budgets. Cover strategies for US, UK, Europe, Africa, Latin America, and Asia markets. No mainstream celebrity suggestions. Be specific with real platforms, realistic costs, and achievable global goals.'
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
  
