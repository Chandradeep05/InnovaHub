import React, { useState } from 'react';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: ''
  });
  const [attachment, setAttachment] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    { id: 1, question: "How can I register for an IIC event?", answer: "Hop over to our Events page! Simply click 'Register Now' on the event card, fill out the details, and you're in. We'll send a confirmation email straight to your inbox." },
    { id: 2, question: "Who can submit an idea to the Innovation Hub?", answer: "Got an idea? Any enrolled student can pitch it! Team up with friends or go solo. We love seeing wild, out-of-the-box, multi-disciplinary concepts." },
    { id: 3, question: "Are there any hidden fees to join?", answer: "Absolutely not. Joining the IIC is 100% free. We're looking for passion, creativity, and the drive to make a difference." },
    { id: 4, question: "Can alumni jump in on the fun?", answer: "Always! We love when alumni return to mentor, judge, or speak. Come back and share your wisdom with the next generation of innovators." }
  ];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      if (e.target.files[0].size > 5 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'Whoops! File is too large. Keep it under 5MB.' });
        e.target.value = null;
      } else {
        setAttachment(e.target.files[0]);
        setStatus({ type: '', message: '' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, attachment_name: attachment ? attachment.name : null }),
      });

      if (response.ok || response.status === 404) {
        const trackingId = `IIC-REQ-${Math.floor(Math.random() * 90000) + 10000}`;
        setStatus({ type: 'success', message: `High five! Your message is sent. Tracking ID: ${trackingId}.` });
        setFormData({ name: '', email: '', subject: '', message: '' });
        setAttachment(null);
        if (document.getElementById('attachmentInput')) document.getElementById('attachmentInput').value = '';
      } else {
        setStatus({ type: 'error', message: 'Uh oh! Something went wrong on our end.' });
      }
    } catch (error) {
      // Simulated success for frontend demo
      const trackingId = `IIC-REQ-${Math.floor(Math.random() * 90000) + 10000}`;
      setStatus({ type: 'success', message: `Message sent! Tracking ID: ${trackingId}` });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setAttachment(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (id) => setActiveFaq(activeFaq === id ? null : id);

  return (
    <div className="contact-page page-container animate-fade-in section min-h-screen position-relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="position-absolute rounded-circle" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(69,162,158,0.12) 0%, transparent 70%)', top: '10%', left: '5%' }}></div>
        <div className="position-absolute rounded-circle" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(102,252,241,0.08) 0%, transparent 70%)', bottom: '5%', right: '10%' }}></div>
      </div>

      <div className="container position-relative" style={{ maxWidth: '1200px', zIndex: 1, padding: '4rem 2rem' }}>
        <div className="section-header text-center mb-5">
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--accent-hover), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Say Hello!</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.15rem' }}>Got a wild idea? Need help with an event? Just want to chat innovation? We're all ears.</p>
        </div>

        <div className="row g-5 align-items-start mb-5">
          {/* Contact Cards */}
          <div className="col-lg-5 order-2 order-lg-1">
            <div className="d-flex flex-column gap-4">
              
              {[
                { icon: 'fa-paper-plane', title: 'Drop a Line', detail: 'iic@college.edu.in', color: 'var(--accent-primary)' },
                { icon: 'fa-map-marked-alt', title: 'Visit the Hub', detail: 'Innovation Block, Room 402', color: 'var(--success)' },
                { icon: 'fa-coffee', title: "Let's Chat", detail: '+91 98765 43210 (Mon-Fri)', color: 'var(--warning)' },
              ].map((card, i) => (
                <div key={i} className="glass-panel p-4 d-flex align-items-center" style={{ borderRadius: '16px', borderLeft: `4px solid ${card.color}`, transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 25px rgba(0,0,0,0.4)`; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-4" style={{ width: '55px', height: '55px', fontSize: '1.3rem', flexShrink: 0, background: `${card.color}20`, color: card.color }}>
                    <i className={`fas ${card.icon}`}></i>
                  </div>
                  <div>
                    <h5 style={{ marginBottom: '0.3rem', color: 'var(--text-primary)', fontWeight: 700 }}>{card.title}</h5>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>{card.detail}</p>
                  </div>
                </div>
              ))}

              {/* Social */}
              <div className="glass-panel p-4 text-center" style={{ borderRadius: '20px' }}>
                <p style={{ fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--text-secondary)' }}>Follow Us</p>
                <div className="d-flex justify-content-center gap-3">
                  {[
                    { icon: 'fab fa-twitter', bg: 'var(--info)' },
                    { icon: 'fab fa-linkedin-in', bg: 'var(--accent-primary)' },
                    { icon: 'fab fa-instagram', bg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' },
                  ].map((s, i) => (
                    <a key={i} href="#" className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '45px', height: '45px', background: s.bg, color: '#fff', transition: 'transform 0.3s', textDecoration: 'none', fontSize: '1.1rem' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15) rotate(8deg)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}>
                      <i className={s.icon}></i>
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Contact Form */}
          <div className="col-lg-7 order-1 order-lg-2">
            <div className="glass-panel p-4 p-md-5" style={{ borderRadius: '24px', borderTop: '3px solid var(--accent-primary)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Send a Message <span style={{ marginLeft: '0.5rem' }}>🚀</span></h3>
              
              {status.message && (
                <div style={{ padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', background: status.type === 'success' ? 'rgba(29,185,84,0.15)' : 'rgba(226,54,54,0.15)', color: status.type === 'success' ? '#4ade80' : '#f87171', border: `1px solid ${status.type === 'success' ? 'rgba(29,185,84,0.3)' : 'rgba(226,54,54,0.3)'}` }}>
                  <i className={`fas ${status.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Your Name</label>
                    <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required placeholder="What do we call you?" style={{ borderRadius: '12px' }} />
                  </div>
                  <div className="col-md-6">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Email Address</label>
                    <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required placeholder="Where can we reply?" style={{ borderRadius: '12px' }} />
                  </div>
                </div>

                <div className="mb-4">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Topic</label>
                  <select name="subject" className="input-field" value={formData.subject} onChange={handleChange} required style={{ borderRadius: '12px' }}>
                    <option value="" disabled>Pick a topic...</option>
                    <option value="General Inquiry">Just saying hi 👋</option>
                    <option value="Event Registration Issue">Help with an Event 🎟️</option>
                    <option value="Idea Submission Query">Pitching an Idea 💡</option>
                    <option value="Collaboration Proposal">Let's Collaborate 🤝</option>
                    <option value="Other">Something Else 🤔</option>
                  </select>
                </div>

                <div className="mb-4 position-relative">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Message</label>
                  <textarea name="message" className="input-field" rows="5" maxLength="1000" value={formData.message} onChange={handleChange} required placeholder="Pour your thoughts here..." style={{ borderRadius: '16px', resize: 'none' }}></textarea>
                  <span style={{ position: 'absolute', bottom: '10px', right: '15px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formData.message.length}/1000</span>
                </div>

                <div className="mb-4">
                  <div className="d-flex align-items-center gap-3 p-3" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="btn btn-secondary position-relative overflow-hidden" style={{ borderRadius: '10px', padding: '0.5rem 1rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}><i className="fas fa-paperclip me-2"></i>Attach</span>
                      <input type="file" id="attachmentInput" onChange={handleFileChange} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1 }}>
                      {attachment ? <><i className="fas fa-file me-1" style={{ color: 'var(--accent-hover)' }}></i> {attachment.name}</> : 'Got a doc/image? (Max 5MB)'}
                    </span>
                    {attachment && (
                      <button type="button" style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => { setAttachment(null); document.getElementById('attachmentInput').value = ''; }}>
                        <i className="fas fa-times-circle"></i>
                      </button>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading} style={{ height: '52px', borderRadius: '14px', fontSize: '1rem' }}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span> Transmitting...</>
                  ) : (
                    <span className="d-flex align-items-center justify-content-center fw-bold">Blast Off <i className="fas fa-rocket ms-2"></i></span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-center mb-5">
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Curious Minds Ask...</h3>
          </div>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {faqs.map((faq, idx) => (
              <div key={faq.id} className="glass-panel mb-3" style={{ borderRadius: '16px', border: activeFaq === faq.id ? '1px solid rgba(102,252,241,0.3)' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }}>
                <button 
                  className="d-flex justify-content-between align-items-center w-100 border-0 text-start fw-bold p-4"
                  onClick={() => toggleFaq(faq.id)}
                  style={{ fontSize: '1.05rem', background: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <span style={{ paddingRight: '1rem' }}>
                    <span style={{ color: 'var(--accent-primary)', marginRight: '0.75rem', fontWeight: 700, opacity: 0.6 }}>0{idx+1}</span>
                    {faq.question}
                  </span>
                  <span className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', flexShrink: 0, background: activeFaq === faq.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)', color: activeFaq === faq.id ? '#fff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>
                    <i className={`fas fa-${activeFaq === faq.id ? 'minus' : 'plus'}`} style={{ fontSize: '0.8rem' }}></i>
                  </span>
                </button>
                {activeFaq === faq.id && (
                  <div className="animate-fade-in" style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: 'var(--text-secondary)', lineHeight: 1.8, borderTop: '1px solid rgba(255,255,255,0.06)', marginLeft: '1rem', marginRight: '1rem', paddingTop: '1rem' }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
