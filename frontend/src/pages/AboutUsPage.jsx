import React from 'react';

const AboutUsPage = () => {
  const leadership = [
    { name: 'Dr. Rajeev Kumar', role: 'Chairman', category: 'Leadership', department: 'IIC, GTBIT', image: 'https://ui-avatars.com/api/?name=Rajeev+Kumar&background=14b8a6&color=fff&size=300&bold=true', quote: 'Innovation is the bridge between knowledge and impact.' },
    { name: 'Prof. Neeta Sharma', role: 'President, IIC', category: 'Leadership', department: 'Computer Science', image: 'https://ui-avatars.com/api/?name=Neeta+Sharma&background=8b5cf6&color=fff&size=300&bold=true', quote: 'Every great startup begins with a curious mind.' },
    { name: 'Dr. Amit Verma', role: 'Faculty Mentor', category: 'Mentor', department: 'AI & Data Science', image: 'https://ui-avatars.com/api/?name=Amit+Verma&background=0891b2&color=fff&size=300&bold=true', quote: 'Mentoring the next generation of creators.' },
    { name: 'Dr. Priya Mehta', role: 'Faculty Mentor', category: 'Mentor', department: 'Electronics', image: 'https://ui-avatars.com/api/?name=Priya+Mehta&background=f59e0b&color=fff&size=300&bold=true', quote: 'Technology meets empathy in great innovations.' },
  ];

  const coreTeam = [
    { name: 'Rahul Singh', role: 'Student President', department: 'CSE, 4th Year', image: 'https://ui-avatars.com/api/?name=Rahul+Singh&background=14b8a6&color=fff&size=300&bold=true' },
    { name: 'Ananya Gupta', role: 'Vice President', department: 'IT, 3rd Year', image: 'https://ui-avatars.com/api/?name=Ananya+Gupta&background=8b5cf6&color=fff&size=300&bold=true' },
    { name: 'Vikram Joshi', role: 'Tech Lead', department: 'AI & DS, 3rd Year', image: 'https://ui-avatars.com/api/?name=Vikram+Joshi&background=0891b2&color=fff&size=300&bold=true' },
    { name: 'Sneha Patel', role: 'Event Coordinator', department: 'ECE, 2nd Year', image: 'https://ui-avatars.com/api/?name=Sneha+Patel&background=ef4444&color=fff&size=300&bold=true' },
    { name: 'Arjun Kapoor', role: 'Design Lead', department: 'CSE, 3rd Year', image: 'https://ui-avatars.com/api/?name=Arjun+Kapoor&background=f59e0b&color=fff&size=300&bold=true' },
    { name: 'Meera Reddy', role: 'PR & Outreach', department: 'IT, 2nd Year', image: 'https://ui-avatars.com/api/?name=Meera+Reddy&background=22c55e&color=fff&size=300&bold=true' },
  ];

  const milestones = [
    { year: '2020', title: 'IIC Established', desc: 'GTBIT received the official IIC mandate from MoE Innovation Cell.' },
    { year: '2021', title: 'First Hackathon', desc: '200+ participants competed in our inaugural 36-hour hackathon.' },
    { year: '2022', title: 'Star Performer', desc: 'Awarded 4-Star rating by MoE for outstanding innovation activities.' },
    { year: '2023', title: 'Incubation Launch', desc: 'Opened the GTBIT Startup Incubation Hub for student-led ventures.' },
    { year: '2024', title: '50+ Events', desc: 'Hosted over 50 workshops, seminars, and competitions in one year.' },
    { year: '2025', title: '5-Star Rating', desc: 'Achieved the highest 5-Star IIC rating from the Ministry of Education.' },
  ];

  return (
    <div className="page-container animate-fade-in">
      {/* Hero */}
      <section className="particle-bg" style={{ padding: '7rem 2rem 5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '5%', right: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', animation: 'floatSlow 20s ease-in-out infinite', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)', animation: 'floatSlow 16s ease-in-out infinite reverse', pointerEvents: 'none' }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge animate-fade-in" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', marginBottom: '1.5rem', fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>
            🏛️ About Our Council
          </span>
          <h1 className="animate-fade-in stagger-1" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Innovation at <span className="gradient-text">GTBIT</span>
          </h1>
          <p className="animate-fade-in stagger-2" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.8 }}>
            The Institution's Innovation Council at Guru Tegh Bahadur Institute of Technology fosters a culture of creativity, entrepreneurship, and problem-solving among students and faculty.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container" style={{ padding: '4rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {[
            { icon: '🎯', title: 'Our Mission', text: 'To build a vibrant innovation ecosystem within GTBIT that nurtures student ideas from concept to prototype, connecting classrooms with industry through mentorship, workshops, and real-world problem solving.' },
            { icon: '🔭', title: 'Our Vision', text: 'To become the leading innovation hub among Delhi\'s technical institutions — producing startup founders, patent holders, and industry-ready graduates who drive India\'s future economy.' },
            { icon: '💎', title: 'Our Values', text: 'Inclusivity, creativity, collaboration, and impact. We believe that every student has an inner innovator, and our role is to provide the right environment, tools, and guidance to let it flourish.' },
          ].map((item, i) => (
            <div key={i} className={`glass-panel hover-lift p-5 animate-fade-in stagger-${i + 1}`} style={{ borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem', animation: 'floatUp 5s ease-in-out infinite', animationDelay: `${i * 0.7}s` }}>{item.icon}</div>
              <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0, fontSize: '0.95rem' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership Section */}
      <section style={{ padding: '4rem 0', background: 'linear-gradient(180deg, var(--bg-color) 0%, rgba(17,24,39,0.4) 50%, var(--bg-color) 100%)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className="animate-fade-in">Our <span className="gradient-text">Leadership</span></h2>
            <div className="glow-divider"></div>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>The guiding force behind GTBIT's innovation ecosystem</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {leadership.map((person, i) => (
              <div key={i} className={`glass-panel hover-lift animate-fade-in stagger-${i + 1}`} style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', textAlign: 'center' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(139,92,246,0.1))', padding: '2rem 1.5rem 1rem' }}>
                  <img src={person.image} alt={person.name} style={{ width: '110px', height: '110px', borderRadius: '50%', border: '3px solid rgba(45,212,191,0.3)', boxShadow: '0 0 25px rgba(45,212,191,0.15)', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                  <h4 style={{ marginBottom: '0.25rem', fontSize: '1.15rem' }}>{person.name}</h4>
                  <span style={{ color: 'var(--accent-hover)', fontWeight: 600, fontSize: '0.9rem' }}>{person.role}</span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0.75rem' }}>{person.department}</p>
                  {person.quote && (
                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', margin: 0, lineHeight: 1.6 }}>
                      "{person.quote}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Team */}
      <section className="container" style={{ padding: '4rem 2rem' }}>
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <h2 className="animate-fade-in">Core <span className="gradient-text">Team</span></h2>
          <div className="glow-divider"></div>
          <p style={{ color: 'var(--text-secondary)' }}>The student leaders driving IIC from the front</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {coreTeam.map((person, i) => (
            <div key={i} className={`glass-panel hover-lift p-4 text-center animate-fade-in stagger-${Math.min(i + 1, 6)}`} style={{ borderRadius: 'var(--radius-xl)' }}>
              <img src={person.image} alt={person.name} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(45,212,191,0.2)', marginBottom: '1rem', objectFit: 'cover' }} />
              <h5 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{person.name}</h5>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>{person.role}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{person.department}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline / Milestones */}
      <section style={{ padding: '4rem 0', background: 'linear-gradient(180deg, var(--bg-color), rgba(17,24,39,0.3), var(--bg-color))' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className="animate-fade-in">Our <span className="gradient-text">Journey</span></h2>
            <div className="glow-divider"></div>
          </div>

          <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: '24px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(180deg, var(--accent-primary), #8b5cf6, transparent)' }}></div>

            {milestones.map((ms, i) => (
              <div key={i} className={`d-flex gap-4 mb-4 animate-fade-in stagger-${Math.min(i + 1, 6)}`} style={{ position: 'relative' }}>
                {/* Dot */}
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--bg-surface)', border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-hover)', zIndex: 1 }}>
                  {ms.year}
                </div>
                <div className="glass-panel hover-lift flex-grow-1 p-4" style={{ borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>{ms.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.92rem' }}>{ms.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ padding: '3rem 2rem 5rem' }}>
        <div className="glass-panel glow-border text-center p-5 animate-fade-in" style={{ borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ marginBottom: '1rem' }}>Want to be Part of the <span className="gradient-text">Story</span>?</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 2rem' }}>Join IIC at GTBIT and leave your mark on the innovation landscape.</p>
          <a href="https://forms.gle/uMpubandEjjDhbLH8" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.05rem' }}>
            <i className="fas fa-rocket me-2"></i> Join IIC Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
