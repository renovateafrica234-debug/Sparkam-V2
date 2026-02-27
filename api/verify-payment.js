const https = require('https');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    const { reference, email } = req.body;
    
    if (!reference) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment reference is required' 
      });
    }
    
    console.log('🔍 Verifying payment:', reference);
    
    // Verify with Paystack
    const verification = await verifyWithPaystack(reference);
    
    console.log('📊 Paystack response:', verification);
    
    // Check if payment was successful
    if (verification.status !== 'success') {
      return res.status(400).json({
        success: false,
        error: 'Payment not successful: ' + verification.status
      });
    }
    
    // Verify amount (₦14,000 = 1,400,000 kobo)
    if (verification.amount !== 1400000) {
      console.warn('⚠️  Amount mismatch:', verification.amount, 'expected: 1400000');
      return res.status(400).json({
        success: false,
        error: 'Payment amount mismatch'
      });
    }
    
    // Verify email matches (optional but recommended)
    if (email && verification.customer.email !== email) {
      console.warn('⚠️  Email mismatch:', verification.customer.email, 'vs', email);
    }
    
    // Payment verified successfully!
    console.log('✅ Payment verified:', reference);
    
    // TODO: Save to database, send email, etc.
    // For now, just return success
    
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        reference: verification.reference,
        amount: verification.amount / 100, // Convert back to Naira
        customerEmail: verification.customer.email,
        paidAt: verification.paid_at,
        channel: verification.channel
      }
    });
    
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Payment verification failed'
    });
  }
};

// Helper function to verify with Paystack API
function verifyWithPaystack(reference) {
  return new Promise((resolve, reject) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!secretKey) {
      return reject(new Error('PAYSTACK_SECRET_KEY not configured'));
    }
    
    if (!secretKey.startsWith('sk_')) {
      return reject(new Error('Invalid Paystack secret key format'));
    }
    
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          if (parsed.status && parsed.data) {
            resolve(parsed.data);
          } else {
            reject(new Error('Invalid Paystack API response: ' + data));
          }
        } catch (err) {
          reject(new Error('Failed to parse Paystack response: ' + err.message));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error('Paystack API request failed: ' + error.message));
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Paystack API timeout'));
    });
    
    req.end();
  });
                   }
        
