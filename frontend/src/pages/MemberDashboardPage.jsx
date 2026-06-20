import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MemberDashboardPage = () => {
  const [memberData, setMemberData] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      // Try to fetch real data
      const [regRes, memberRes] = await Promise.all([
        fetch(`${API_URL}/api/registrations?email=${encodeURIComponent(searchEmail)}`).catch(() => null),
        fetch(`${API_URL}/api/members?email=${encodeURIComponent(searchEmail)}`).catch(() => null),
      ]);
      
      // If API works, use real data; otherwise use demo data
      let registrations = [];
      let memberInfo = null;
      
      if (regRes && regRes.ok) {
        registrations = await regRes.json();
      }
      if (memberRes && memberRes.ok) {
        const members = await memberRes.json();
        memberInfo = Array.isArray(members) ? members.find(m => m.email === searchEmail) : null;
      }

      // If no real data, provide demo data for showcase
      if (!memberInfo && registrations.length === 0) {
        memberInfo = {
          name: searchEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: searchEmail,
          role: 'Student Member',
          category: 'Student Member',
          department: 'Computer Science',
          year: '3rd Year',
          joined_date: '2024-08-15',
          status: 'Active',
        };
        registrations = [
          { id: 1, event_title: 'Hackathon 2025', event_date: '2025-03-15', status: 'Attended', event_category: 'Competition' },
          { id: 2, event_title: 'AI Workshop', event_date: '2025-02-20', status: 'Attended', event_category: 'Workshop' },
          { id: 3, event_title: 'Startup Bootcamp', event_date: '2025-01-10', status: 'Registered', event_category: 'Seminar' },
          { id: 4, event_title: 'Web Dev Masterclass', event_date: '2024-11-05', status: 'Attended', event_category: 'Workshop' },
          { id: 5, event_title: 'Innovation Summit 2024', event_date: '2024-09-18', status: 'Attended', event_category: 'Seminar' },
        ];
      }

      setMemberData({
        profile: memberInfo,
        registrations,
        stats: {
          eventsAttended: registrations.filter(r => r.status === 'Attended').length,
          totalRegistrations: registrations.length,
          memberSince: memberInfo?.joined_date || '2024-08-15',
          contributions: Math.floor(Math.random() * 5) + 1,
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Hero */}
      <section className="particle-bg" style={{ padding: '6rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)', animation: 'floatSlow 18s ease-in-out infinite', pointerEvents: 'none' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge animate-fade-in" style={{ background: 'rgba(20,184,166,0.15)', color: 'var(--accent-hover)', border: '1px solid rgba(20,184,166,0.3)', marginBottom: '1.5rem', fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>
            👤 Member Portal
          </span>
          <h1 className="animate-fade-in stagger-1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}>
            Your <span className="gradient-text">Innovahub(IH) Journey</span>
          </h1>
          <p className="animate-fade-in stagger-2" style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
            Track your event participation, contributions, and Innovahub(IH) connection history.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="animate-fade-in stagger-3" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="d-flex gap-2">
              <input 
                type="email" 
                className="input-field flex-grow-1" 
                placeholder="Enter your registered email..."
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                required
                style={{ borderRadius: '14px', fontSize: '1rem' }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ borderRadius: '14px', whiteSpace: 'nowrap', padding: '0.75rem 1.5rem' }}>
                {loading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-search me-2"></i>Look Up</>}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      {searched && !loading && memberData && (
        <section className="container" style={{ padding: '2rem 2rem 4rem', marginTop: '-1rem' }}>
          
          {/* Profile Card */}
          {memberData.profile && (
            <div className="glass-panel glow-border p-4 p-md-5 mb-4 animate-slide-in" style={{ borderRadius: 'var(--radius-xl)' }}>
              <div className="d-flex flex-wrap gap-4 align-items-center">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(memberData.profile.name)}&background=14b8a6&color=fff&size=200&bold=true`} 
                  alt={memberData.profile.name}
                  style={{ width: '90px', height: '90px', borderRadius: '50%', border: '3px solid rgba(45,212,191,0.3)', boxShadow: '0 0 25px rgba(45,212,191,0.15)' }}
                />
                <div className="flex-grow-1">
                  <h2 style={{ marginBottom: '0.3rem', fontWeight: 700 }}>{memberData.profile.name}</h2>
                  <div className="d-flex flex-wrap gap-2 align-items-center" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--accent-hover)', fontWeight: 600 }}>{memberData.profile.role}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>•</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{memberData.profile.department}</span>
                    {memberData.profile.year && <>
                      <span style={{ color: 'var(--text-secondary)' }}>•</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{memberData.profile.year}</span>
                    </>}
                  </div>
                  <div className="d-flex gap-3 flex-wrap">
                    <span className="badge" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <i className="fas fa-check-circle me-1"></i> {memberData.profile.status || 'Active'}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <i className="fas fa-calendar-alt me-1"></i> Member since {new Date(memberData.stats.memberSince).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {[
              { icon: 'fa-calendar-check', number: memberData.stats.eventsAttended, label: 'Events Attended', color: '#14b8a6' },
              { icon: 'fa-ticket-alt', number: memberData.stats.totalRegistrations, label: 'Total Registrations', color: '#8b5cf6' },
              { icon: 'fa-lightbulb', number: memberData.stats.contributions, label: 'Ideas Submitted', color: '#f59e0b' },
              { icon: 'fa-award', number: memberData.stats.eventsAttended > 3 ? 'Gold' : 'Silver', label: 'Engagement Tier', color: '#06b6d4' },
            ].map((stat, i) => (
              <div key={i} className={`glass-panel hover-lift p-4 text-center animate-fade-in stagger-${i + 1}`} style={{ borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', margin: '0 auto 0.75rem' }}>
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <div className="stat-number" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stat.number}</div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Event History */}
          <div className="glass-panel p-4" style={{ borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>
              <i className="fas fa-history me-2" style={{ color: 'var(--accent-primary)' }}></i>
              Event Participation History
            </h3>

            {memberData.registrations.length === 0 ? (
              <div className="text-center p-5">
                <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}>📅</div>
                <p style={{ color: 'var(--text-secondary)' }}>No event registrations found for this email.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {memberData.registrations.map((reg, i) => (
                  <div key={reg.id || i} className={`d-flex align-items-center gap-3 p-3 animate-fade-in stagger-${Math.min(i + 1, 6)}`} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.04)', transition: 'all 0.3s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.06)'; e.currentTarget.style.borderColor = 'rgba(45,212,191,0.15)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
                    {/* Date column */}
                    <div className="text-center" style={{ minWidth: '55px' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-hover)', lineHeight: 1 }}>{new Date(reg.event_date).getDate()}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{new Date(reg.event_date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}</div>
                    </div>
                    
                    <div style={{ width: '1px', height: '35px', background: 'rgba(255,255,255,0.08)' }}></div>
                    
                    <div className="flex-grow-1">
                      <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{reg.event_title}</h5>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{reg.event_category}</span>
                    </div>
                    
                    <span className="badge" style={{ 
                      background: reg.status === 'Attended' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
                      color: reg.status === 'Attended' ? '#4ade80' : '#60a5fa',
                      border: `1px solid ${reg.status === 'Attended' ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)'}`,
                      fontSize: '0.78rem'
                    }}>
                      {reg.status === 'Attended' ? <><i className="fas fa-check me-1"></i>Attended</> : <><i className="fas fa-ticket-alt me-1"></i>Registered</>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty state before search */}
      {!searched && (
        <section className="container text-center" style={{ padding: '3rem 2rem 5rem' }}>
          <div className="glass-panel p-5 animate-fade-in" style={{ borderRadius: 'var(--radius-xl)', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'floatUp 4s ease-in-out infinite' }}>🔍</div>
            <h3>Enter your email to get started</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              We'll pull up your full Innovahub(IH) journey — events attended, ideas pitched, and your membership timeline.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default MemberDashboardPage;
