import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/ui/EventCard';

const HomePage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counters, setCounters] = useState({ events: 0, ideas: 0, members: 0 });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        const data = await response.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const filtered = data
          .filter(e => new Date(e.event_date) >= today && e.registration_open)
          .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
          .slice(0, 3);
        setUpcomingEvents(filtered);
      } catch (err) {
        console.error("Error fetching future events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Animated counter effect
  useEffect(() => {
    const targets = { events: 50, ideas: 120, members: 200 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCounters({
        events: Math.round(targets.events * eased),
        ideas: Math.round(targets.ideas * eased),
        members: Math.round(targets.members * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="page-container">
      {/* ===== HERO SECTION ===== */}
      <section className="particle-bg" style={{ 
        padding: '8rem 2rem 6rem', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(17,24,39,0.3) 0%, var(--bg-color) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated gradient orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)', animation: 'floatSlow 18s ease-in-out infinite', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '5%', right: '10%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', animation: 'floatSlow 22s ease-in-out infinite reverse', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '40%', right: '30%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', animation: 'floatUp 10s ease-in-out infinite', pointerEvents: 'none' }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-in">
            <span className="badge" style={{ background: 'rgba(20,184,166,0.15)', color: 'var(--accent-hover)', border: '1px solid rgba(20,184,166,0.3)', marginBottom: '1.5rem', fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>
              🚀 Institution's Innovation Council
            </span>
          </div>
          
          <h1 className="animate-fade-in stagger-1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '1.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            <span className="gradient-text">Innovate</span>. Create. <br/>
            <span style={{ color: 'var(--text-primary)' }}>Inspire the Future.</span>
          </h1>
          
          <p className="animate-fade-in stagger-2" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
            Transform your wildest ideas into reality. Join a community of 200+ innovators building tomorrow's solutions today.
          </p>
          
          <div className="animate-fade-in stagger-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/innovation-hub" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '50px' }}>
              <i className="fas fa-lightbulb me-2"></i> Submit an Idea
            </Link>
            <Link to="/events" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '50px' }}>
              <i className="fas fa-calendar-alt me-2"></i> Upcoming Events
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="container" style={{ padding: '0 2rem', marginTop: '-3rem', position: 'relative', zIndex: 2 }}>
        <div className="glass-panel glow-border" style={{ borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {[
            { icon: 'fa-calendar-check', number: `${counters.events}+`, label: 'Events Hosted', color: '#14b8a6' },
            { icon: 'fa-lightbulb', number: `${counters.ideas}+`, label: 'Ideas Submitted', color: '#8b5cf6' },
            { icon: 'fa-users', number: `${counters.members}+`, label: 'Active Members', color: '#06b6d4' },
          ].map((stat, i) => (
            <div key={i} className={`animate-fade-in stagger-${i + 1}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <span className="stat-number" style={{ fontSize: '2.5rem' }}>{stat.number}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== UPCOMING EVENTS ===== */}
      <section className="container" style={{ padding: '5rem 2rem 4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h2 className="animate-fade-in" style={{ marginBottom: '0.5rem' }}>
              Upcoming <span className="gradient-text">Events</span>
            </h2>
            <div className="glow-divider" style={{ margin: '0 0 0.75rem' }}></div>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Don't miss out on workshops, competitions, and seminars.</p>
          </div>
          <Link to="/events" className="btn btn-outline-primary rounded-pill d-none d-md-inline-flex" style={{ padding: '0.6rem 1.5rem' }}>
            View All <i className="fas fa-arrow-right ms-2"></i>
          </Link>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', animationDelay: `${i * 0.15}s` }}>
                <div className="skeleton" style={{ height: '200px', width: '100%', borderRadius: 0 }}></div>
                <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="skeleton" style={{ height: '28px', width: '80%', marginBottom: '1rem' }}></div>
                  <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '0.5rem' }}></div>
                  <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: '1.5rem' }}></div>
                  <div className="skeleton" style={{ height: '60px', width: '100%', marginBottom: '1.5rem' }}></div>
                  <div className="skeleton" style={{ height: '44px', width: '100%', marginTop: 'auto' }}></div>
                </div>
              </div>
            ))
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, i) => (
              <div key={event.id} className={`animate-slide-in stagger-${i + 1}`}>
                <EventCard event={event} />
              </div>
            ))
          ) : (
            <div className="glass-panel text-center p-5" style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📅</div>
              <h3>No Upcoming Events</h3>
              <p style={{ color: 'var(--text-secondary)' }}>We are planning new and exciting events. Check back soon!</p>
            </div>
          )}
        </div>
        <div className="text-center mt-4 d-md-none">
          <Link to="/events" className="btn btn-outline-primary w-100 rounded-pill">View All Events</Link>
        </div>
      </section>

      {/* ===== WHY JOIN SECTION ===== */}
      <section className="particle-bg" style={{ padding: '5rem 0', background: 'linear-gradient(180deg, var(--bg-color) 0%, rgba(17,24,39,0.4) 50%, var(--bg-color) 100%)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className="animate-fade-in">Why Join <span className="gradient-text">IIC</span>?</h2>
            <div className="glow-divider"></div>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>Be part of something bigger than yourself</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🧠', title: 'Learn & Grow', desc: 'Attend expert-led workshops on emerging technologies, design thinking, and entrepreneurship.' },
              { icon: '🤝', title: 'Build Your Network', desc: 'Connect with industry mentors, faculty advisors, and fellow innovators across departments.' },
              { icon: '🏆', title: 'Win & Showcase', desc: 'Compete in hackathons, pitch your startup ideas, and get featured on our innovation wall.' },
              { icon: '💡', title: 'Incubate Ideas', desc: 'Get funding support, workspace, and mentorship to turn your prototype into a real product.' },
            ].map((item, i) => (
              <div key={i} className={`glass-panel hover-lift p-4 animate-fade-in stagger-${i + 1}`} style={{ borderRadius: 'var(--radius-xl)', textAlign: 'center', cursor: 'default' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'floatUp 4s ease-in-out infinite', animationDelay: `${i * 0.5}s` }}>{item.icon}</div>
                <h4 style={{ marginBottom: '0.75rem' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="container" style={{ padding: '4rem 2rem 5rem' }}>
        <div className="glass-panel glow-border animate-fade-in" style={{ borderRadius: 'var(--radius-xl)', padding: '4rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '20%', left: '5%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', animation: 'floatSlow 12s ease-in-out infinite', pointerEvents: 'none' }}></div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', position: 'relative' }}>
            Ready to <span className="gradient-text">Innovate</span>?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '1.1rem', position: 'relative' }}>
            Take the first step. Join India's most vibrant campus innovation community.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
            <a href="https://forms.gle/uMpubandEjjDhbLH8" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '50px' }}>
              <i className="fas fa-rocket me-2"></i> Join IIC Now
            </a>
            <Link to="/contact" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '50px' }}>
              <i className="fas fa-envelope me-2"></i> Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
