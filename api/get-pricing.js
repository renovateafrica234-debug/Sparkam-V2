module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Get country from query or detect from IP
    const country = req.query.country || await detectCountryFromIP(req);
    
    // Get pricing for region
    const pricing = getPricingForCountry(country);
    
    return res.status(200).json({
      success: true,
      country: pricing.country,
      countryName: pricing.countryName,
      currency: pricing.currency,
      currencySymbol: pricing.symbol,
      paymentProvider: pricing.paymentProvider,
      tiers: {
        free: {
          name: 'Free',
          price: 0,
          priceFormatted: pricing.symbol + '0',
          interval: 'forever',
          features: [
            '1 campaign per month',
            'Basic AI strategy generation',
            '30 content concept ideas',
            'Limited Claude chat (10 messages/day)',
            'View-only dashboard',
            'Community support'
          ],
          limitations: [
            'No content downloads',
            'No templates',
            'No automation'
          ]
        },
        essential: {
          name: 'Essential',
          price: pricing.essential,
          priceFormatted: pricing.symbol + pricing.essential.toLocaleString(),
          interval: 'month',
          features: [
            'Unlimited AI campaign strategies',
            '90 branded content pieces per campaign',
            'Unlimited Claude AI chat support 🤖',
            'Template-based content creation',
            'Download all content (ZIP files)',
            'Performance tracking dashboard',
            'Email support',
            'Content calendar & scheduling guide'
          ]
        },
        pro: {
          name: 'Pro',
          price: pricing.pro,
          priceFormatted: pricing.symbol + pricing.pro.toLocaleString(),
          interval: 'month',
          popular: true,
          features: [
            'Everything in Essential, PLUS:',
            'Auto-posting to your social accounts',
            'We schedule & post content for you',
            'Weekly 15-min strategy calls',
            'Campaign performance reports',
            'Priority support (24hr response)',
            'Advanced analytics dashboard',
            'Real-time optimization alerts'
          ]
        },
        platinum: {
          name: 'Platinum',
          price: pricing.platinum,
          priceFormatted: pricing.symbol + pricing.platinum.toLocaleString(),
          interval: 'month',
          features: [
            'Everything in Pro, PLUS:',
            'Dedicated account manager',
            'Bi-weekly 30-min strategy sessions',
            'Custom content creation (10 premium pieces)',
            'Influencer outreach management',
            'Playlist pitching service',
            'Press release distribution',
            'VIP support (4hr response)',
            'White-glove onboarding'
          ]
        },
        enterprise: {
          name: 'Enterprise',
          price: 'Custom',
          priceFormatted: 'Custom Pricing',
          interval: 'custom',
          features: [
            'Everything in Platinum, PLUS:',
            'Multiple artists/releases',
            'White-label options',
            'API access',
            'Custom integrations',
            'Dedicated team',
            'SLA guarantees',
            'Custom contracts'
          ]
        }
      },
      betaDiscount: {
        active: true,
        discount: 50, // 50% off
        firstCustomers: 100,
        message: '🎁 First 100 customers get 50% off forever!'
      }
    });
    
  } catch (error) {
    console.error('Pricing error:', error);
    
    // Fallback to US pricing
    return res.status(200).json({
      success: true,
      country: 'US',
      countryName: 'International',
      currency: 'USD',
      currencySymbol: '$',
      paymentProvider: 'stripe',
      tiers: getDefaultTiers('$'),
      betaDiscount: {
        active: true,
        discount: 50,
        firstCustomers: 100
      }
    });
  }
};

// Regional Value Pricing (NOT currency conversion!)
function getPricingForCountry(countryCode) {
  const pricingTable = {
    // NIGERIA - Local pricing
    'NG': {
      country: 'NG',
      countryName: 'Nigeria',
      currency: 'NGN',
      symbol: '₦',
      essential: 49000,
      pro: 99000,
      platinum: 199000,
      paymentProvider: 'paystack'
    },
    
    // AFRICA - Similar to Nigeria
    'GH': { // Ghana
      country: 'GH',
      countryName: 'Ghana',
      currency: 'GHS',
      symbol: '₵',
      essential: 750,
      pro: 1500,
      platinum: 3000,
      paymentProvider: 'paystack'
    },
    'KE': { // Kenya
      country: 'KE',
      countryName: 'Kenya',
      currency: 'KES',
      symbol: 'KSh',
      essential: 6300,
      pro: 12800,
      platinum: 25600,
      paymentProvider: 'flutterwave'
    },
    'ZA': { // South Africa
      country: 'ZA',
      countryName: 'South Africa',
      currency: 'ZAR',
      symbol: 'R',
      essential: 900,
      pro: 1800,
      platinum: 3600,
      paymentProvider: 'paystack'
    },
    
    // INTERNATIONAL - Higher pricing (purchasing power)
    'US': { // United States
      country: 'US',
      countryName: 'United States',
      currency: 'USD',
      symbol: '$',
      essential: 49,
      pro: 99,
      platinum: 199,
      paymentProvider: 'stripe'
    },
    'CA': { // Canada
      country: 'CA',
      countryName: 'Canada',
      currency: 'CAD',
      symbol: 'C$',
      essential: 65,
      pro: 130,
      platinum: 260,
      paymentProvider: 'stripe'
    },
    'GB': { // United Kingdom
      country: 'GB',
      countryName: 'United Kingdom',
      currency: 'GBP',
      symbol: '£',
      essential: 39,
      pro: 79,
      platinum: 159,
      paymentProvider: 'stripe'
    },
    'AU': { // Australia
      country: 'AU',
      countryName: 'Australia',
      currency: 'AUD',
      symbol: 'A$',
      essential: 75,
      pro: 150,
      platinum: 300,
      paymentProvider: 'stripe'
    }
  };
  
  // EU countries default to Euro
  const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'PT', 'IE', 'AT'];
  if (euCountries.includes(countryCode)) {
    return {
      country: countryCode,
      countryName: 'Europe',
      currency: 'EUR',
      symbol: '€',
      essential: 45,
      pro: 90,
      platinum: 180,
      paymentProvider: 'stripe'
    };
  }
  
  // Default to international pricing
  return pricingTable[countryCode] || pricingTable['US'];
}

// Detect country from IP
async function detectCountryFromIP(req) {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                req.headers['x-real-ip'] || 
                req.connection?.remoteAddress ||
                '8.8.8.8';
    
    // Skip localhost
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168')) {
      return 'NG'; // Default to Nigeria for local dev
    }
    
    // Use ipapi.co (free, no key needed)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    
    console.log('Detected country:', data.country_code, 'from IP:', ip);
    
    return data.country_code || 'US';
    
  } catch (error) {
    console.error('IP detection error:', error);
    return 'US';
  }
}

function getDefaultTiers(symbol) {
  return {
    free: {
      name: 'Free',
      price: 0,
      priceFormatted: symbol + '0',
      features: ['1 campaign/month', 'Basic features', 'Limited chat']
    },
    essential: {
      name: 'Essential',
      price: 49,
      priceFormatted: symbol + '49',
      features: ['Unlimited campaigns', '90 content pieces', 'Unlimited chat']
    },
    pro: {
      name: 'Pro',
      price: 99,
      priceFormatted: symbol + '99',
      popular: true,
      features: ['Everything in Essential', 'Auto-posting', 'Weekly calls']
    },
    platinum: {
      name: 'Platinum',
      price: 199,
      priceFormatted: symbol + '199',
      features: ['Everything in Pro', 'Dedicated manager', 'VIP support']
    }
  };
          }
        
