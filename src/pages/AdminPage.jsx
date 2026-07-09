import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useMuseums } from '../contexts/MuseumsContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

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
  
  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const isNew = editId === 'new';
      const url = isNew 
        ? `http://localhost:3000/api/museums?lang=${lang}` 
        : `http://localhost:3000/api/museums/${editId}?lang=${lang}`;
        
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
              <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }} onClick={() => setEditId('new')}>+ Add New Museum</button>
            </header>
            
            {editId ? (() => {
              const isNew = editId === 'new';
              const mData = isNew ? {} : (museums.find(m => m.id === editId)?.[lang] || museums.find(m => m.id === editId)?.uz || {});
              const mInfo = mData.info || {};
              return (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', padding: 40, animation: 'fhRise .3s ease' }}>
                <h3 style={{ margin: '0 0 24px', fontFamily: 'var(--font-head)', fontSize: 28, color: 'var(--fg)' }}>
                  {isNew ? 'Create New Museum' : `Edit Museum: ${editId}`}
                </h3>
                <form onSubmit={handleSave}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Name ({lang})</label>
                      <input name="name" type="text" defaultValue={mData.name} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Address</label>
                      <input name="address" type="text" defaultValue={mInfo.address} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Founded</label>
                      <input name="founded" type="text" defaultValue={mInfo.founded} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Hours</label>
                      <input name="hours" type="text" defaultValue={mInfo.hours} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Entry Fee</label>
                      <input name="entry" type="text" defaultValue={mInfo.entry} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Phone</label>
                      <input name="phone" type="text" defaultValue={mInfo.phone} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>Biography ({lang})</label>
                      <textarea name="bio" defaultValue={mData.bio} rows={6} style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none', resize: 'vertical', lineHeight: 1.5 }} />
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
                                {m.heroImage && <img src={`http://localhost:3000${m.heroImage}`} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
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
                            <button onClick={() => setEditId(m.id)} style={{ padding: '8px 16px', fontSize: 13, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', color: 'var(--fg)', fontWeight: 500, transition: 'all .2s' }}>Edit</button>
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

        {/* OTHER TABS */}
        {['quizzes', 'settings'].includes(activeTab) && (
          <div style={{ animation: 'fhFade .3s ease both', color: 'var(--muted)', padding: '80px 40px', textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 'calc(var(--radius) * 1.5)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, color: 'var(--fg)', margin: '0 0 12px' }}>Under Construction</h2>
            <p style={{ margin: 0, fontSize: 15, maxWidth: 400, marginInline: 'auto', lineHeight: 1.5 }}>
              The <strong>{activeTab}</strong> module is currently in development. Global statistics and configuration will be available soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
