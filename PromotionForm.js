import React, { useState } from 'react';

// Sparkam AI Music Promo - Beta Testing Version
const PromotionForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    artistName: ''
  });
  const [status, setStatus] = useState('idle');

  const handlePromotionSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // THE HANDSHAKE: Sending data to the AI Brain (Zapier)
      // This uses the Webhook URL you copied from the Parent Zap
      const response = await fetch(process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          artistName: formData.artistName,
          timestamp: new Date().toISOString(),
          appVersion: '1.0.0-beta'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ fullName: '', email: '', artistName: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('AI Brain Connection Error:', error);
      setStatus('error');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>SPARKAM AI</h1>
        <p style={styles.subtitle}>Music Promotion App (Beta)</p>
      </header>

      <form onSubmit={handlePromotionSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Your Name"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Artist Name</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Your Stage Name"
            value={formData.artistName}
            onChange={(e) => setFormData({...formData, artistName: e.target.value})}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={status === 'sending'}
          style={status === 'sending' ? {...styles.button, opacity: 0.7} : styles.button}
        >
          {status === 'sending' ? 'CONNECTING BRAIN...' : 'START PROMO'}
        </button>

        {status === 'success' && <p style={styles.success}>Data sent to AI Brain!</p>}
        {status === 'error' && <p style={styles.error}>Connection failed. Check Vercel Logs.</p>}
      </form>
    </div>
  );
};

// Social Media Design Theme Styling
const styles = {
  container: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  logo: {
    fontSize: '24px',
    fontWeight: '900',
    letterSpacing: '2px',
    background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  },
  subtitle: { fontSize: '12px', color: '#888' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#ccc' },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#111',
    color: '#fff',
    outline: 'none'
  },
  button: {
    marginTop: '10px',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0095f6', // Social Media Blue
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  success: { color: '#00ff00', textAlign: 'center', fontSize: '14px' },
  error: { color: '#ff4444', textAlign: 'center', fontSize: '14px' }
};

export default PromotionForm;
  
