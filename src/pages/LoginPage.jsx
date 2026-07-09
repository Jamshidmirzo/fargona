import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--surface)', padding: 48, borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--line)', width: '100%', maxWidth: 440, boxShadow: '0 12px 40px rgba(0,0,0,0.08)', animation: 'fhRise .4s ease both' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 800 }}>A</div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, margin: '0 0 8px', color: 'var(--fg)' }}>Admin Access</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, margin: 0 }}>Please sign in to continue to the dashboard.</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && <div style={{ padding: '12px 16px', background: 'color-mix(in srgb, #D32F2F 12%, transparent)', color: '#D32F2F', borderRadius: 8, fontSize: 14, fontWeight: 500, textAlign: 'center' }}>{error}</div>}
          
          <div>
            <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Enter your username"
              style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 15, outline: 'none', transition: 'border .2s' }} 
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 15, outline: 'none', transition: 'border .2s' }} 
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: 15, marginTop: 12, width: '100%', display: 'block' }}>
            Sign In
          </button>
        </form>
        
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', width: '100%', marginTop: 24, padding: '10px', fontSize: 14, cursor: 'pointer', transition: 'all .2s' }}>
          ← Back to Main Site
        </button>
      </div>
    </div>
  );
}
