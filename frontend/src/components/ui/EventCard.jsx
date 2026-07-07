import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const eventDate = new Date(event.event_date);
  const formattedDate = eventDate.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  
  return (
    <div className="card glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Image */}
      <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
        <img 
          src={event.banner_image_url || 'https://via.placeholder.com/800x450?text=Event+Banner'} 
          alt={event.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, rgba(17,24,39,0.9), transparent)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <span style={{ 
            background: 'linear-gradient(135deg, var(--accent-primary), #0891b2)', 
            color: 'white', padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700',
            boxShadow: '0 2px 10px rgba(20, 184, 166, 0.3)', letterSpacing: '0.03em', textTransform: 'uppercase'
          }}>
            {event.category}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', lineHeight: '1.4', fontWeight: 700 }}>{event.title}</h3>
        
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="far fa-calendar-alt" style={{ width: '16px', textAlign: 'center', color: 'var(--accent-primary)' }}></i>
            <span>{formattedDate}, {event.event_time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="fas fa-map-marker-alt" style={{ width: '16px', textAlign: 'center', color: 'var(--accent-primary)' }}></i>
            <span>{event.venue}</span>
          </div>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.7 }}>
          {event.description}
        </p>
        
        <div style={{ marginTop: 'auto' }}>
          {event.registration_open ? (
            <button className="btn btn-primary w-100" onClick={() => window.location.href=`/events?register=${event.id}`} style={{ borderRadius: '10px' }}>
              Register Now <i className="fas fa-arrow-right ms-2"></i>
            </button>
          ) : (
            <button className="btn w-100" disabled style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              Registration Closed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
