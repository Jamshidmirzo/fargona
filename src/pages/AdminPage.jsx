import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useMuseums } from '../contexts/MuseumsContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const mockTraffic = [
  { name: 'Mon', visits: 1200 },
  { name: 'Tue', visits: 1350 },
  { name: 'Wed', visits: 1100 },
  { name: 'Thu', visits: 1700 },
  { name: 'Fri', visits: 1900 },
  { name: 'Sat', visits: 2400 },
  { name: 'Sun', visits: 2200 },
];

const mockActivity = [
  { id: 1, user: 'User_492', action: 'completed quiz', target: 'Uvaysiy', time: '12m ago', score: '5/5' },
  { id: 2, user: 'User_118', action: 'started virtual tour', target: 'Hamza', time: '1h ago', score: null },
  { id: 3, user: 'User_844', action: 'saved museum', target: 'Haziniy', time: '3h ago', score: null },
  { id: 4, user: 'User_021', action: 'completed quiz', target: 'Muqimiy', time: '5h ago', score: '4/5' },
];

export default function AdminPage() {
  const { museums, loading } = useMuseums();
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editId, setEditId] = useState(null);
  const [formLang, setFormLang] = useState(lang);
  
  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const isNew = editId === 'new';
      const url = isNew 
        ? `${API_URL}/api/museums?lang=${formLang}` 
        : `${API_URL}/api/museums/${editId}?lang=${formLang}`;
        
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        window.location.reload();
      } else {
        alert('Failed to save museum data');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving museum data');
    }
  };

  if (loading) return <div style={{padding:48, textAlign:'center', color:'var(--muted)'}}>Loading museums...</div>;

  const mCount = museums.length;
  const qCount = museums.reduce((acc, m) => acc + (m[lang]?.quiz?.length || 0), 0);

  const mockQuizData = museums.map(m => ({
    name: (m[lang] || m.uz || m.ru || m.en || m).name?.split(' ')[0] || 'Unknown', // short name
    completions: Math.floor(Math.random() * 400) + 100
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'color-mix(in srgb, var(--surface) 90%, transparent)', backdropFilter: 'blur(8px)', border: '1px solid var(--line)', padding: '12px 16px', borderRadius: 'var(--radius)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
          <p style={{ margin: '0 0 6px', color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</p>
          <p style={{ margin: 0, color: 'var(--fg)', fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700 }}>
            {payload[0].value} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>{payload[0].name}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: 280, borderRight: '1px solid var(--line)', background: 'var(--surface2)', padding: '40px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 32px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>A</div>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-head)', fontWeight: 700, letterSpacing: '.05em', color: 'var(--fg)' }}>Farg'ona Admin</div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '0 16px', gap: 4 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z' },
            { id: 'museums', label: 'Museums Data', icon: 'M4 6h16M4 12h16M4 18h16' },
            { id: 'quizzes', label: 'Quizzes & Stats', icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
            { id: 'settings', label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z' }
          ].map(tb => (
            <button key={tb.id} onClick={() => { setActiveTab(tb.id); setEditId(null); }} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              textAlign: 'left', background: activeTab === tb.id ? 'var(--surface)' : 'transparent',
              border: '1px solid', borderColor: activeTab === tb.id ? 'var(--line)' : 'transparent',
              borderRadius: 12, padding: '12px 16px', cursor: 'pointer', fontSize: 14.5, fontFamily: 'var(--font-ui)',
              color: activeTab === tb.id ? 'var(--fg)' : 'var(--muted)', fontWeight: activeTab === tb.id ? 600 : 400,
              transition: 'all .2s'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: activeTab === tb.id ? 1 : 0.6, color: activeTab === tb.id ? 'var(--accent)' : 'inherit' }}>
                <path d={tb.icon} />
              </svg>
              {tb.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '0 32px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', width: '100%', padding: '10px', borderRadius: 99, fontSize: 13, cursor: 'pointer', transition: 'all .2s' }}>
            ← Back to Site
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '48px 56px', maxWidth: 1200, margin: '0 auto', overflowY: 'auto' }}>
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div style={{ animation: 'fhFade .4s ease both' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 38 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 36, margin: '0 0 8px', color: 'var(--fg)' }}>Dashboard Overview</h1>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15 }}>Welcome back! Here's what's happening today.</p>
              </div>
              <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>Download Report</button>
            </header>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
              {[
                { label: 'Total Museum Views', value: '11,850', trend: '+14%', color: 'var(--accent)' },
                { label: 'Active Users (7d)', value: '3,240', trend: '+5%', color: 'var(--fg)' },
                { label: 'Avg. Quiz Score', value: '82%', trend: '+2%', color: '#2E7D32' }
              ].map((m, i) => (
                <div key={i} style={{ padding: 28, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: m.color }} />
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>{m.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: 44, color: 'var(--fg)', fontWeight: 800, lineHeight: 1 }}>{m.value}</div>
                    <div style={{ fontSize: 14, color: '#2E7D32', fontWeight: 600, background: 'color-mix(in srgb, #2E7D32 12%, transparent)', padding: '4px 8px', borderRadius: 6 }}>{m.trend}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 40 }}>
              
              {/* Line Chart */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', padding: 32 }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 20, margin: '0 0 24px', color: 'var(--fg)' }}>Traffic Over 7 Days</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTraffic} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--line)', strokeWidth: 2 }} />
                      <Line type="monotone" dataKey="visits" name="Visits" stroke="var(--accent)" strokeWidth={4} dot={{ r: 4, fill: 'var(--surface)', strokeWidth: 2 }} activeDot={{ r: 7, strokeWidth: 0, fill: 'var(--accent)' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Feed */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', padding: 32, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 20, margin: '0 0 24px', color: 'var(--fg)' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
                  {mockActivity.map(act => (
                    <div key={act.id} style={{ display: 'flex', gap: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--fg)', flexShrink: 0, border: '1px solid var(--line)' }}>
                        {act.user.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, color: 'var(--fg)', lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 600 }}>{act.user}</span> {act.action} <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{act.target}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{act.time}</div>
                          {act.score && <div style={{ fontSize: 11, background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>Score: {act.score}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 16, textAlign: 'left', padding: 0 }}>View All Activity →</button>
              </div>
            </div>

            {/* Bottom Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
               <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', padding: 32 }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 20, margin: '0 0 24px', color: 'var(--fg)' }}>Quiz Completions by Museum</h3>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockQuizData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface2)', opacity: 0.5 }} />
                      <Bar dataKey="completions" name="Completions" radius={[6, 6, 0, 0]}>
                        {mockQuizData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 50%, var(--bg))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* MUSEUMS TAB */}
        {activeTab === 'museums' && (
          <div style={{ animation: 'fhFade .3s ease both' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 38 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 36, margin: '0 0 8px', color: 'var(--fg)' }}>Museums Database</h1>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15 }}>Manage {mCount} locations across the Fergana Valley.</p>
              </div>
              <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }} onClick={() => { setEditId('new'); setFormLang(lang); }}>+ Add New Museum</button>
            </header>
            
            {editId ? (() => {
              const isNew = editId === 'new';
              const museumObj = museums.find(m => m.id === editId) || {};
              const mData = isNew ? {} : (museumObj[formLang] || museumObj.uz || museumObj.ru || museumObj.en || {});
              const mInfo = mData.info || {};
              return (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', padding: 40, animation: 'fhRise .3s ease' }}>
                <h3 style={{ margin: '0 0 24px', fontFamily: 'var(--font-head)', fontSize: 28, color: 'var(--fg)' }}>
                  {isNew ? 'Create New Museum' : `Edit Museum: ${editId}`}
                </h3>
                
                {/* Language Switcher Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 30, borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
                  {['uz', 'ru', 'en'].map(l => (
                    <button type="button" key={l} onClick={() => setFormLang(l)} style={{
                      fontFamily: 'var(--font-ui)', cursor: 'pointer', padding: '8px 16px', borderRadius: 8,
                      border: formLang === l ? '1px solid var(--accent)' : '1px solid var(--line)',
                      background: formLang === l ? 'var(--accent)' : 'var(--surface2)',
                      color: formLang === l ? 'var(--accent-fg)' : 'var(--muted)',
                      fontWeight: formLang === l ? 600 : 400,
                      fontSize: 13.5
                    }}>
                      {l.toUpperCase()} {l === lang ? '(Active UI)' : ''}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSave}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {isNew && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Unique ID (English lowercase, no spaces, e.g. "al_farghani")</label>
                        <input name="id" type="text" placeholder="e.g. al_farghani" required style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                      </div>
                    )}
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Name ({formLang.toUpperCase()})</label>
                      <input name="name" type="text" defaultValue={mData.name || ''} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Address ({formLang.toUpperCase()})</label>
                      <input name="address" type="text" defaultValue={mInfo.address || ''} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Founded Date ({formLang.toUpperCase()})</label>
                      <input name="founded" type="text" defaultValue={mInfo.founded || ''} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Hours ({formLang.toUpperCase()})</label>
                      <input name="hours" type="text" defaultValue={mInfo.hours || ''} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Entry Fee ({formLang.toUpperCase()})</label>
                      <input name="entry" type="text" defaultValue={mInfo.entry || ''} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Phone</label>
                      <input name="phone" type="text" defaultValue={mInfo.phone || ''} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>

                    <div style={{ height: 1, background: 'var(--line)', gridColumn: '1 / -1', margin: '8px 0' }} />

                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>City (Select location category)</label>
                      <select name="city" defaultValue={museumObj.city || 'kokand'} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }}>
                        <option value="kokand">Qo'qon / Коканд / Kokand</option>
                        <option value="margilan">Marg'ilon / Маргилан / Margilan</option>
                        <option value="fergana">Farg'ona / Фергана / Fergana</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Established Year (Number, e.g. 1959)</label>
                      <input name="established" type="number" defaultValue={museumObj.established || ''} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Author Birth Year (Number, e.g. 1889)</label>
                      <input name="birth" type="number" defaultValue={museumObj.birth || ''} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Author Death Year (Number, e.g. 1929)</label>
                      <input name="death" type="number" defaultValue={museumObj.death || ''} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>

                    <div style={{ height: 1, background: 'var(--line)', gridColumn: '1 / -1', margin: '8px 0' }} />

                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Real GPS Latitude (e.g. 40.525)</label>
                      <input name="lat" type="number" step="any" defaultValue={museumObj.coords?.[0] || ''} placeholder="40.5" style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Real GPS Longitude (e.g. 70.945)</label>
                      <input name="lon" type="number" step="any" defaultValue={museumObj.coords?.[1] || ''} placeholder="70.9" style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>2D Layout Grid X position (0 to 100)</label>
                      <input name="pos_x" type="number" step="any" defaultValue={museumObj.pos?.x ?? 50} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>2D Layout Grid Y position (0 to 100)</label>
                      <input name="pos_y" type="number" step="any" defaultValue={museumObj.pos?.y ?? 50} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>

                    <div style={{ height: 1, background: 'var(--line)', gridColumn: '1 / -1', margin: '8px 0' }} />

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Biography ({formLang.toUpperCase()})</label>
                      <textarea name="bio" defaultValue={mData.bio || ''} rows={6} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none', resize: 'vertical', lineHeight: 1.5 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                    <button type="submit" className="btn-primary">Save Changes</button>
                    <button type="button" className="btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                </form>
              </div>
              );
            })() : (
              <div style={{ background: 'var(--surface)', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--line)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
                    <thead style={{ background: 'var(--surface2)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)' }}>
                      <tr>
                        <th style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>Museum</th>
                        <th style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>City</th>
                        <th style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>Status</th>
                        <th style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {museums.map(m => (
                        <tr key={m.id} style={{ borderBottom: '1px solid var(--line)', transition: 'background .2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                              <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: 'var(--surface2)', flexShrink: 0, border: '1px solid var(--line)' }}>
                                {m.heroImage && <img src={`${API_URL}${m.heroImage}`} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                              </div>
                              <div>
                                <div style={{ color: 'var(--fg)', fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{(m[lang] || m.uz || m.ru || m.en || m).name}</div>
                                <div style={{ color: 'var(--muted)', fontSize: 13 }}>ID: {m.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', color: 'var(--fg)' }}>
                            <div style={{ display: 'inline-block', padding: '4px 10px', background: 'color-mix(in srgb, var(--fg) 8%, transparent)', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>
                              {m.city.charAt(0).toUpperCase() + m.city.slice(1)}
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#2E7D32', background: 'color-mix(in srgb, #2E7D32 10%, transparent)', padding: '4px 10px', borderRadius: 99, fontWeight: 600 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E7D32' }} /> Active
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <button onClick={() => { setEditId(m.id); setFormLang(lang); }} style={{ padding: '8px 16px', fontSize: 13, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', color: 'var(--fg)', fontWeight: 500, transition: 'all .2s' }}>Edit</button>
                            <button onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this museum?')) {
                                try {
                                  const res = await fetch(`${API_URL}/api/museums/${m.id}`, { method: 'DELETE' });
                                  if (res.ok) window.location.reload();
                                  else alert('Failed to delete museum');
                                } catch (e) {
                                  alert('Error deleting museum');
                                }
                              }
                            }} style={{ padding: '8px 16px', fontSize: 13, background: '#D32F2F', border: '1px solid #D32F2F', borderRadius: 8, cursor: 'pointer', color: 'white', fontWeight: 500, transition: 'all .2s', marginLeft: 8 }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUIZZES TAB */}
        {activeTab === 'quizzes' && (() => {
          // Flatten quizzes with museum context
          const allQuizzes = [];
          museums.forEach(m => {
            const mData = m[lang] || m.uz || {};
            const qList = mData.quiz || [];
            qList.forEach(q => {
              allQuizzes.push({
                museumId: m.id,
                museumName: mData.name,
                questionId: q.id,
                q: q.q,
                options: q.options,
                a: q.a
              });
            });
          });

          return (
            <div style={{ animation: 'fhFade .3s ease both' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32, alignItems: 'start' }}>
                
                {/* LIST OF EXISTING QUIZZES */}
                <div style={{ background: 'var(--surface)', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--line)', padding: 32 }}>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 26, margin: '0 0 24px', color: 'var(--fg)' }}>Active Quiz Questions</h2>
                  
                  {allQuizzes.length === 0 ? (
                    <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>No quiz questions configured yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {allQuizzes.map((q, idx) => (
                        <div key={q.questionId || idx} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 20, background: 'var(--surface2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                            <div>
                              <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                                {q.museumName}
                              </div>
                              <h4 style={{ fontSize: 16, margin: 0, color: 'var(--fg)', fontWeight: 600 }}>{q.q}</h4>
                            </div>
                            <button 
                              onClick={async () => {
                                if (window.confirm('Delete this quiz question?')) {
                                  try {
                                    const res = await fetch(`${API_URL}/api/museums/${q.museumId}/quizzes/${q.questionId}`, { method: 'DELETE' });
                                    if (res.ok) window.location.reload();
                                    else alert('Failed to delete question');
                                  } catch (e) {
                                    alert('Error deleting question');
                                  }
                                }
                              }}
                              style={{ padding: '6px 12px', fontSize: 12, background: 'transparent', border: '1px solid #D32F2F', color: '#D32F2F', borderRadius: 6, cursor: 'pointer', transition: 'all .2s' }}
                            >
                              Delete
                            </button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} style={{ fontSize: 13.5, padding: '8px 12px', borderRadius: 8, background: q.a === oIdx ? 'color-mix(in srgb, #2E7D32 10%, transparent)' : 'var(--surface)', border: q.a === oIdx ? '1px solid #2E7D32' : '1px solid var(--line)', color: q.a === oIdx ? '#2E7D32' : 'var(--fg)', fontWeight: q.a === oIdx ? 600 : 400 }}>
                                {oIdx + 1}. {opt} {q.a === oIdx ? '✓' : ''}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ADD NEW QUESTION FORM */}
                <div style={{ background: 'var(--surface)', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--line)', padding: 32 }}>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 26, margin: '0 0 24px', color: 'var(--fg)' }}>Add Quiz Question</h2>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const museumId = formData.get('museumId');
                    const question = formData.get('question');
                    const options = [
                      formData.get('opt0'),
                      formData.get('opt1'),
                      formData.get('opt2'),
                      formData.get('opt3')
                    ];
                    const answer = parseInt(formData.get('answer'), 10);

                    try {
                      const res = await fetch(`${API_URL}/api/museums/${museumId}/quizzes?lang=${lang}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question, options, answer })
                      });
                      if (res.ok) {
                        window.location.reload();
                      } else {
                        alert('Failed to add quiz question');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Error adding quiz question');
                    }
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Select Museum</label>
                        <select name="museumId" required style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 15, outline: 'none' }}>
                          {museums.map(m => (
                            <option key={m.id} value={m.id}>{(m[lang] || m.uz || {}).name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Question Text ({lang.toUpperCase()})</label>
                        <input name="question" type="text" required placeholder="e.g. In which year was the poet born?" style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Options ({lang.toUpperCase()})</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <input name="opt0" type="text" required placeholder="Option 1" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14.5, outline: 'none' }} />
                          <input name="opt1" type="text" required placeholder="Option 2" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14.5, outline: 'none' }} />
                          <input name="opt2" type="text" required placeholder="Option 3" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14.5, outline: 'none' }} />
                          <input name="opt3" type="text" required placeholder="Option 4" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14.5, outline: 'none' }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Correct Option Index</label>
                        <select name="answer" required style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 15, outline: 'none' }}>
                          <option value="0">Option 1</option>
                          <option value="1">Option 2</option>
                          <option value="2">Option 3</option>
                          <option value="3">Option 4</option>
                        </select>
                      </div>

                      <button type="submit" className="btn-primary" style={{ padding: 16, fontSize: 15, marginTop: 8 }}>Add Question</button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          );
        })()}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div style={{ animation: 'fhFade .3s ease both', color: 'var(--muted)', padding: '80px 40px', textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 'calc(var(--radius) * 1.5)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, color: 'var(--fg)', margin: '0 0 12px' }}>Under Construction</h2>
            <p style={{ margin: 0, fontSize: 15, maxWidth: 400, marginInline: 'auto', lineHeight: 1.5 }}>
              The <strong>settings</strong> module is currently in development. Configuration will be available soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
