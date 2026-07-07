import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EventCard from '../components/ui/EventCard';
import './EventsPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SAMPLE_EVENTS = [
  {
    id: 'sample-1',
    title: 'Xenothon 2026 — National Level Hackathon',
    description: 'A 36-hour hackathon where 500+ participants build innovative solutions for real-world challenges. Top teams win prizes worth ₹2,00,000.',
    event_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    event_time: '09:00',
    venue: 'Main Auditorium, Block A',
    category: 'Hackathon',
    banner_image_url: 'https://picsum.photos/seed/hackathon/800/450',
    registration_open: true,
  },
  {
    id: 'sample-2',
    title: 'AI/ML Workshop — Building with LLMs',
    description: 'Hands-on workshop on building applications with Large Language Models. Learn prompt engineering, RAG pipelines, and fine-tuning.',
    event_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    event_time: '14:00',
    venue: 'Smart Lab 204, CS Block',
    category: 'Workshop',
    banner_image_url: 'https://picsum.photos/seed/aiworkshop/800/450',
    registration_open: true,
  },
  {
    id: 'sample-3',
    title: 'Startup Pitch Night — Season 3',
    description: 'Present your startup idea to a panel of investors and industry mentors. Get feedback, funding leads, and networking opportunities.',
    event_date: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
    event_time: '17:30',
    venue: 'Innovation Hub, Room 101',
    category: 'Competition',
    banner_image_url: 'https://picsum.photos/seed/pitchnight/800/450',
    registration_open: true,
  },
  {
    id: 'sample-4',
    title: 'IoT Bootcamp — Smart Campus Edition',
    description: 'Two-day intensive bootcamp on Internet of Things. Built smart sensors, programmed Arduino boards, and deployed real campus solutions.',
    event_date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    event_time: '10:00',
    venue: 'Electronics Lab, Block B',
    category: 'Workshop',
    banner_image_url: 'https://picsum.photos/seed/iotbootcamp/800/450',
    registration_open: false,
  },
  {
    id: 'sample-5',
    title: 'Design Thinking Masterclass',
    description: 'An immersive session on human-centered design principles. Participants learned ideation, prototyping, and user testing techniques.',
    event_date: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
    event_time: '11:00',
    venue: 'Seminar Hall 3, Admin Block',
    category: 'Seminar',
    banner_image_url: 'https://picsum.photos/seed/designthinking/800/450',
    registration_open: false,
  },
];

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tabs: upcoming, calendar, past
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Registration Modal State
  const [searchParams, setSearchParams] = useSearchParams();
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [regData, setRegData] = useState({
    student_name: '', roll_number: '', email: '', phone: '', department: '', year: ''
  });
  const [regStatus, setRegStatus] = useState({ type: '', message: '' });
  const [regLoading, setRegLoading] = useState(false);

  // Past Events Filters & Pagination
  const [pastYearFilter, setPastYearFilter] = useState('');
  const [pastCategoryFilter, setPastCategoryFilter] = useState('');
  const [pastSearchQuery, setPastSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // Check if we need to open registration modal immediately
    const eventIdToRegister = searchParams.get('register');
    if (eventIdToRegister && events.length > 0) {
      const ev = events.find(e => e.id === parseInt(eventIdToRegister));
      if (ev) {
        setSelectedEvent(ev);
        setShowRegistration(true);
      }
    }
  }, [searchParams, events]);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/events`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter(e => new Date(e.event_date) >= todayDate)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  const allPastEvents = events
    .filter(e => new Date(e.event_date) < todayDate)
    .sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

  // Filter Past Events
  const filteredPastEvents = allPastEvents.filter(e => {
    const matchYear = pastYearFilter ? new Date(e.event_date).getFullYear().toString() === pastYearFilter : true;
    const matchCat = pastCategoryFilter ? e.category === pastCategoryFilter : true;
    const matchSearch = pastSearchQuery ? e.title.toLowerCase().includes(pastSearchQuery.toLowerCase()) : true;
    return matchYear && matchCat && matchSearch;
  });

  // Pagination for Past Events
  const totalPages = Math.ceil(filteredPastEvents.length / itemsPerPage);
  const paginatedPastEvents = filteredPastEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Registration Handlers
  const openRegistration = (event) => {
    setSelectedEvent(event);
    setShowRegistration(true);
    setRegStatus({ type: '', message: '' });
  };

  const closeRegistration = () => {
    setShowRegistration(false);
    setSelectedEvent(null);
    setRegStatus({ type: '', message: '' });
    setRegData({ student_name: '', roll_number: '', email: '', phone: '', department: '', year: '' });
    // Remove query param
    searchParams.delete('register');
    setSearchParams(searchParams);
  };

  const handleRegChange = (e) => setRegData({ ...regData, [e.target.name]: e.target.value });

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${API_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...regData, event_id: selectedEvent.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegStatus({ type: 'success', message: 'Registration successful! Check your email for QR code.' });
        setRegData({ student_name: '', roll_number: '', email: '', phone: '', department: '', year: '' });
      } else {
        setRegStatus({ type: 'error', message: data.error || 'Registration failed.' });
      }
    } catch (err) {
      setRegStatus({ type: 'error', message: 'Network error. Try again later.' });
    } finally {
      setRegLoading(false);
    }
  };

  // Calendar Helpers
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    let days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateStr = new Date(year, month, day).toDateString();
      const dayEvents = events.filter(e => new Date(e.event_date).toDateString() === currentDateStr);
      
      const isToday = new Date().toDateString() === currentDateStr;
      const isPast = new Date(year, month, day) < todayDate && !isToday;
      
      let dayClass = 'calendar-day';
      if (isToday) dayClass += ' today';
      else if (isPast) dayClass += ' past';
      
      days.push(
        <div key={day} className={dayClass}>
          <span className="date-number">{day}</span>
          <div className="day-events">
            {dayEvents.map(ev => (
              <div 
                key={ev.id} 
                className={`event-marker ${isPast ? 'past-event' : 'future-event'}`} 
                title={ev.title}
                onClick={() => ev.registration_open && !isPast ? openRegistration(ev) : null}
              >
                {ev.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="events-page page-container animate-fade-in section min-h-screen">
      <div className="container">
        <div className="section-header text-center">
          <h2>Events & Activities</h2>
          <p className="text-secondary">Explore upcoming workshops, competitions, and seminars or browse our past successes.</p>
        </div>

        <div className="tabs mb-4 text-center">
          <button className={`btn ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'} me-2`} onClick={() => setActiveTab('upcoming')}>Upcoming Events</button>
          <button className={`btn ${activeTab === 'calendar' ? 'btn-primary' : 'btn-outline-primary'} me-2`} onClick={() => setActiveTab('calendar')}>Calendar View</button>
          <button className={`btn ${activeTab === 'past' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('past')}>Past Events</button>
        </div>

        {loading && <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div><p className="mt-3">Loading events...</p></div>}
        
        {error && <div className="alert alert-danger text-center">{error}</div>}

        {!loading && !error && activeTab === 'upcoming' && (
          <div className="upcoming-events">
            {(upcomingEvents.length === 0 ? SAMPLE_EVENTS.filter(e => new Date(e.event_date) >= todayDate) : upcomingEvents).length === 0 ? (
              <div className="glass-panel text-center p-5">
                <i className="far fa-calendar-times fs-1 text-secondary mb-3"></i>
                <p>No upcoming events at this time. Check back later!</p>
              </div>
            ) : (
              <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {(upcomingEvents.length > 0 ? upcomingEvents : SAMPLE_EVENTS.filter(e => new Date(e.event_date) >= todayDate)).map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'calendar' && (
          <div className="calendar-container glass-card p-4">
            <div className="calendar-header d-flex justify-content-between align-items-center mb-4">
              <button className="btn btn-sm btn-outline-secondary" onClick={prevMonth}><i className="fas fa-chevron-left"></i></button>
              <h3 className="m-0">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <button className="btn btn-sm btn-outline-secondary" onClick={nextMonth}><i className="fas fa-chevron-right"></i></button>
            </div>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-day-header text-center fw-bold py-2">{day}</div>
              ))}
              {renderCalendar()}
            </div>
            <div className="calendar-legend mt-4 d-flex justify-content-center gap-4 text-secondary small">
              <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: 'var(--primary)', borderRadius: '3px', marginRight: '6px' }}></span> Upcoming</div>
              <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: 'var(--bg-lighter)', border: '1px solid var(--border-color)', borderRadius: '3px', marginRight: '6px' }}></span> Past</div>
              <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#e3f2fd', border: '1px solid #90caf9', borderRadius: '3px', marginRight: '6px' }}></span> Today</div>
            </div>
          </div>
        )}

        {!loading && !error && activeTab === 'past' && (
          <div className="past-events">
            <div className="filters glass-card p-3 mb-4 d-flex flex-wrap gap-3 align-items-end">
              <div className="form-group mb-0 flex-grow-1" style={{ minWidth: '200px' }}>
                <label className="small mb-1">Search Event</label>
                <div className="position-relative">
                  <i className="fas fa-search position-absolute" style={{ top: '12px', left: '12px', color: 'var(--text-secondary)' }}></i>
                  <input type="text" className="form-control ps-5" placeholder="Search by name..." value={pastSearchQuery} onChange={e => setPastSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="form-group mb-0" style={{ minWidth: '150px' }}>
                <label className="small mb-1">Year</label>
                <select className="form-control" value={pastYearFilter} onChange={e => setPastYearFilter(e.target.value)}>
                  <option value="">All Years</option>
                  {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group mb-0" style={{ minWidth: '150px' }}>
                <label className="small mb-1">Category</label>
                <select className="form-control" value={pastCategoryFilter} onChange={e => setPastCategoryFilter(e.target.value)}>
                  <option value="">All Categories</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Competition">Competition</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Field Trip">Field Trip</option>
                </select>
              </div>
            </div>

            {(paginatedPastEvents.length === 0 && allPastEvents.length === 0) ? (
              <>
                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {SAMPLE_EVENTS.filter(e => new Date(e.event_date) < todayDate).map(event => (
                    <div key={event.id} className="card glass-card past-event-card">
                      <img src={event.banner_image_url || 'https://via.placeholder.com/800x450?text=Past+Event'} alt={event.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                      <div className="p-3">
                        <span className="badge bg-secondary mb-2">{new Date(event.event_date).getFullYear()} | {event.category}</span>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{event.title}</h4>
                        <p className="text-secondary small mb-3">
                          <i className="far fa-calendar-alt me-1"></i> {new Date(event.event_date).toLocaleDateString('en-GB')}
                        </p>
                        <div className="d-flex justify-content-between">
                          <button className="btn btn-sm btn-outline-primary">View Report</button>
                          <button className="btn btn-sm btn-outline-secondary">Photos</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : paginatedPastEvents.length === 0 ? (
              <div className="text-center py-5 text-secondary">No past events match your filters.</div>
            ) : (
              <>
                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {paginatedPastEvents.map(event => (
                    <div key={event.id} className="card glass-card past-event-card">
                      <img src={event.banner_image_url || 'https://via.placeholder.com/800x450?text=Past+Event'} alt={event.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                      <div className="p-3">
                        <span className="badge bg-secondary mb-2">{new Date(event.event_date).getFullYear()} | {event.category}</span>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{event.title}</h4>
                        <p className="text-secondary small mb-3">
                          <i className="far fa-calendar-alt me-1"></i> {new Date(event.event_date).toLocaleDateString('en-GB')}
                        </p>
                        <div className="d-flex justify-content-between">
                          <button className="btn btn-sm btn-outline-primary">View Report</button>
                          <button className="btn btn-sm btn-outline-secondary">Photos</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="pagination d-flex justify-content-center align-items-center mt-5 gap-3">
                    <button className="btn btn-outline-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><i className="fas fa-chevron-left"></i></button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button className="btn btn-outline-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><i className="fas fa-chevron-right"></i></button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showRegistration && selectedEvent && (
        <div className="modal-overlay d-flex justify-content-center align-items-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000 }}>
          <div className="modal-content glass-card p-0 animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', margin: '1rem' }}>
            <div className="modal-header p-4 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-lighter)' }}>
              <h3 className="m-0" style={{ fontSize: '1.25rem' }}>Register for Event</h3>
              <button className="btn-close" onClick={closeRegistration} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text)' }}>&times;</button>
            </div>
            
            <div className="modal-body p-4">
              <div className="mb-4">
                <h4 className="text-primary mb-1">{selectedEvent.title}</h4>
                <p className="text-secondary small m-0"><i className="far fa-calendar-alt me-1"></i> {new Date(selectedEvent.event_date).toLocaleDateString()} | <i className="far fa-clock me-1"></i> {selectedEvent.event_time}</p>
                <p className="text-secondary small mt-1"><i className="fas fa-map-marker-alt me-1"></i> {selectedEvent.venue}</p>
              </div>

              {regStatus.message && (
                <div className={`alert alert-${regStatus.type} mb-4`}>
                  {regStatus.message}
                </div>
              )}

              {regStatus.type !== 'success' && (
                <form onSubmit={handleRegistrationSubmit}>
                  <div className="form-group mb-3">
                    <label className="fw-500 mb-1">Student Name *</label>
                    <input type="text" name="student_name" value={regData.student_name} onChange={handleRegChange} required maxLength="100" className="form-control" placeholder="Full Name" />
                  </div>
                  <div className="form-group mb-3">
                    <label className="fw-500 mb-1">Roll Number *</label>
                    <input type="text" name="roll_number" value={regData.roll_number} onChange={handleRegChange} required maxLength="20" className="form-control" placeholder="E.g., 22CS014" />
                  </div>
                  <div className="form-group mb-3">
                    <label className="fw-500 mb-1">Email Address *</label>
                    <input type="email" name="email" value={regData.email} onChange={handleRegChange} required className="form-control" placeholder="student@college.edu.in" />
                  </div>
                  <div className="form-group mb-3">
                    <label className="fw-500 mb-1">Phone Number *</label>
                    <input type="tel" name="phone" value={regData.phone} onChange={handleRegChange} required pattern="[0-9]{10}" title="Please enter a valid 10-digit phone number" className="form-control" placeholder="10-digit number" />
                  </div>
                  <div className="row mb-4">
                    <div className="col-md-6 form-group mb-3 mb-md-0">
                      <label className="fw-500 mb-1">Department *</label>
                      <select name="department" value={regData.department} onChange={handleRegChange} required className="form-control">
                        <option value="">Select Dept</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="MECH">MECH</option>
                        <option value="CIVIL">CIVIL</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 form-group mb-0">
                      <label className="fw-500 mb-1">Year *</label>
                      <select name="year" value={regData.year} onChange={handleRegChange} required className="form-control">
                        <option value="">Select Year</option>
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                      </select>
                    </div>
                  </div>
                  <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-primary w-100" disabled={regLoading}>
                      {regLoading ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Submitting...</> : 'Complete Registration'}
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            {regStatus.type === 'success' && (
              <div className="modal-footer p-4 border-top text-center" style={{ backgroundColor: 'var(--bg-lighter)' }}>
                <button className="btn btn-secondary w-100" onClick={closeRegistration}>Close Window</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
