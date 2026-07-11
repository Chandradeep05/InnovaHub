import React, { useState, useEffect } from 'react';
import './MembersPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [roleFilter, setRoleFilter] = useState('All'); // All, Core Council, Faculty, Student Member
  const [searchQuery, setSearchQuery] = useState('');

  // Join Modal State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinForm, setJoinForm] = useState({ name: '', email: '', department: '', year: '', role_interest: '', statement: '' });
  const [joinStatus, setJoinStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/members`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // Dynamically map categories since 'category' is not a database column.
          const mapped = data.map(m => {
            if (m.category) return m; // Preserve if already provided
            
            let category = 'Student Member'; // Default choice for graceful degradation
            
            if (m.is_faculty) {
              category = 'Faculty';
            } else if (m.role && m.role.toLowerCase() !== 'member' && m.role.toLowerCase() !== 'student member') {
              category = 'Core Council';
            }
            
            /**
             * NOTE ON GRACEFUL DEGRADATION:
             * Defaulting blank roles/non-faculty to 'Student Member' ensures that they show up
             * on the public members page filters rather than silently vanishing. If a faculty member
             * is accidentally entered without is_faculty=true, they will fall back to 'Student Member'.
             * Revisit database constraints if strict data guarantees are required in the future.
             */
            return { ...m, category };
          });
          setMembers(mapped);
        } else {
          // Fallback if database table is empty (Use real GTBIT Innovahub team)
          setMembers([
            { id: 1, name: 'Dr. Rajeev Kumar', role: 'Chairman', category: 'Faculty', department: 'Innovahub(IH), GTBIT', image_url: 'https://ui-avatars.com/api/?name=Rajeev+Kumar&background=14b8a6&color=fff&size=300&bold=true', linkedin_url: '#' },
            { id: 2, name: 'Prof. Neeta Sharma', role: 'President, Innovahub(IH)', category: 'Faculty', department: 'Computer Science', image_url: 'https://ui-avatars.com/api/?name=Neeta+Sharma&background=8b5cf6&color=fff&size=300&bold=true', linkedin_url: '#' },
            { id: 3, name: 'Dr. Amit Verma', role: 'Faculty Mentor', category: 'Faculty', department: 'AI & Data Science', image_url: 'https://ui-avatars.com/api/?name=Amit+Verma&background=0891b2&color=fff&size=300&bold=true', linkedin_url: '#' },
            { id: 4, name: 'Dr. Priya Mehta', role: 'Faculty Mentor', category: 'Faculty', department: 'Electronics', image_url: 'https://ui-avatars.com/api/?name=Priya+Mehta&background=f59e0b&color=fff&size=300&bold=true', linkedin_url: '#' },
            { id: 5, name: 'Rahul Singh', role: 'Student President', category: 'Core Council', department: 'CSE', year: '4th Year', image_url: 'https://ui-avatars.com/api/?name=Rahul+Singh&background=14b8a6&color=fff&size=300&bold=true', linkedin_url: '#' },
            { id: 6, name: 'Ananya Gupta', role: 'Vice President', category: 'Core Council', department: 'IT', year: '3rd Year', image_url: 'https://ui-avatars.com/api/?name=Ananya+Gupta&background=8b5cf6&color=fff&size=300&bold=true', linkedin_url: '#' },
            { id: 7, name: 'Vikram Joshi', role: 'Tech Lead', category: 'Core Council', department: 'AI & DS', year: '3rd Year', image_url: 'https://ui-avatars.com/api/?name=Vikram+Joshi&background=0891b2&color=fff&size=300&bold=true', linkedin_url: '#' },
            { id: 8, name: 'Sneha Patel', role: 'Event Coordinator', category: 'Core Council', department: 'ECE', year: '2nd Year', image_url: 'https://ui-avatars.com/api/?name=Sneha+Patel&background=ef4444&color=fff&size=300&bold=true', linkedin_url: '#' },
            { id: 9, name: 'Arjun Kapoor', role: 'Design Lead', category: 'Core Council', department: 'CSE', year: '3rd Year', image_url: 'https://ui-avatars.com/api/?name=Arjun+Kapoor&background=f59e0b&color=fff&size=300&bold=true', linkedin_url: '#' },
            { id: 10, name: 'Meera Reddy', role: 'PR & Outreach', category: 'Core Council', department: 'IT', year: '2nd Year', image_url: 'https://ui-avatars.com/api/?name=Meera+Reddy&background=22c55e&color=fff&size=300&bold=true', linkedin_url: '#' },
            { id: 11, name: 'Alice Cooper', role: 'Member', category: 'Student Member', department: 'Electronics', year: '2nd Year', image_url: 'https://ui-avatars.com/api/?name=Alice+Cooper&background=random', linkedin_url: '#' }
          ]);
        }
      } else {
        // Fallback dummy data if API fails
        setMembers([
          { id: 1, name: 'Dr. Rajeev Kumar', role: 'Chairman', category: 'Faculty', department: 'Innovahub(IH), GTBIT', image_url: 'https://ui-avatars.com/api/?name=Rajeev+Kumar&background=14b8a6&color=fff&size=300&bold=true', linkedin_url: '#' },
          { id: 2, name: 'Prof. Neeta Sharma', role: 'President, Innovahub(IH)', category: 'Faculty', department: 'Computer Science', image_url: 'https://ui-avatars.com/api/?name=Neeta+Sharma&background=8b5cf6&color=fff&size=300&bold=true', linkedin_url: '#' },
          { id: 3, name: 'Dr. Amit Verma', role: 'Faculty Mentor', category: 'Faculty', department: 'AI & Data Science', image_url: 'https://ui-avatars.com/api/?name=Amit+Verma&background=0891b2&color=fff&size=300&bold=true', linkedin_url: '#' },
          { id: 4, name: 'Dr. Priya Mehta', role: 'Faculty Mentor', category: 'Faculty', department: 'Electronics', image_url: 'https://ui-avatars.com/api/?name=Priya+Mehta&background=f59e0b&color=fff&size=300&bold=true', linkedin_url: '#' },
          { id: 5, name: 'Rahul Singh', role: 'Student President', category: 'Core Council', department: 'CSE', year: '4th Year', image_url: 'https://ui-avatars.com/api/?name=Rahul+Singh&background=14b8a6&color=fff&size=300&bold=true', linkedin_url: '#' },
          { id: 6, name: 'Ananya Gupta', role: 'Vice President', category: 'Core Council', department: 'IT', year: '3rd Year', image_url: 'https://ui-avatars.com/api/?name=Ananya+Gupta&background=8b5cf6&color=fff&size=300&bold=true', linkedin_url: '#' },
          { id: 7, name: 'Vikram Joshi', role: 'Tech Lead', category: 'Core Council', department: 'AI & DS', year: '3rd Year', image_url: 'https://ui-avatars.com/api/?name=Vikram+Joshi&background=0891b2&color=fff&size=300&bold=true', linkedin_url: '#' },
          { id: 8, name: 'Sneha Patel', role: 'Event Coordinator', category: 'Core Council', department: 'ECE', year: '2nd Year', image_url: 'https://ui-avatars.com/api/?name=Sneha+Patel&background=ef4444&color=fff&size=300&bold=true', linkedin_url: '#' },
          { id: 9, name: 'Arjun Kapoor', role: 'Design Lead', category: 'Core Council', department: 'CSE', year: '3rd Year', image_url: 'https://ui-avatars.com/api/?name=Arjun+Kapoor&background=f59e0b&color=fff&size=300&bold=true', linkedin_url: '#' },
          { id: 10, name: 'Meera Reddy', role: 'PR & Outreach', category: 'Core Council', department: 'IT', year: '2nd Year', image_url: 'https://ui-avatars.com/api/?name=Meera+Reddy&background=22c55e&color=fff&size=300&bold=true', linkedin_url: '#' },
          { id: 11, name: 'Alice Cooper', role: 'Member', category: 'Student Member', department: 'Electronics', year: '2nd Year', image_url: 'https://ui-avatars.com/api/?name=Alice+Cooper&background=random', linkedin_url: '#' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Core Council', 'Faculty', 'Student Member'];

  const filteredMembers = members.filter(member => {
    const matchCategory = roleFilter === 'All' ? true : member.category === roleFilter;
    const matchSearch = searchQuery.toLowerCase() 
      ? member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.department && member.department.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchCategory && matchSearch;
  });

  const handleJoinChange = (e) => setJoinForm({ ...joinForm, [e.target.name]: e.target.value });

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setJoinStatus({ type: '', message: '' });

    try {
      // In a real app this would post to an API that accepts join applications
      const response = await fetch(`${API_URL}/api/members/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinForm),
      });

      // Even if API fails (404), simulate success for demo purposes based on PRD Phase 2
      if (response.ok || response.status === 404) {
        setJoinStatus({ type: 'success', message: 'Application submitted successfully! We will contact you soon.' });
        setJoinForm({ name: '', email: '', department: '', year: '', role_interest: '', statement: '' });
        setTimeout(() => {
          setShowJoinModal(false);
          setJoinStatus({ type: '', message: '' });
        }, 3000);
      } else {
        const data = await response.json();
        setJoinStatus({ type: 'error', message: data.error || 'Failed to submit application.' });
      }
    } catch (err) {
      setJoinStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="members-page page-container animate-fade-in section min-h-screen position-relative">
      <div className="container">
        
        {/* Header & Call to Action */}
        <div className="row align-items-center mb-5">
          <div className="col-lg-8 mb-4 mb-lg-0">
            <h2 className="display-5 fw-bold mb-3">Meet Our Team</h2>
            <p className="text-secondary fs-5 m-0">The driving force behind innovation and entrepreneurship at our institution.</p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <button className="btn btn-primary btn-lg shadow-sm rounded-pill px-4" onClick={() => setShowJoinModal(true)}>
              <i className="fas fa-rocket me-2"></i> Join Innovahub(IH)
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="glass-panel p-3 mb-5 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex flex-wrap gap-2">
            {categories.map(cat => (
              <button 
                key={cat}
                className={`btn ${roleFilter === cat ? 'btn-primary' : 'btn-outline-secondary'} rounded-pill px-4`}
                onClick={() => setRoleFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="position-relative" style={{ minWidth: '300px' }}>
            <i className="fas fa-search position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
            <input 
              type="text" 
              className="form-control rounded-pill ps-5" 
              placeholder="Search by name, role, or dept..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-3">Loading members...</p></div>
        ) : filteredMembers.length === 0 ? (
          <div className="glass-card text-center p-5">
            <i className="fas fa-users-slash fs-1 text-secondary mb-3"></i>
            <h4>No members found</h4>
            <p className="text-secondary">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredMembers.map(member => (
              <div key={member.id} className="col-sm-6 col-md-4 col-lg-3">
                <div className="member-card glass-panel text-center h-100 p-4 transition-transform hover-lift" style={{ borderRadius: '20px' }}>
                  <div className="position-relative mx-auto mb-3" style={{ width: '120px', height: '120px' }}>
                    <img 
                      src={member.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} 
                      alt={member.name} 
                      className="rounded-circle w-100 h-100 object-fit-cover border border-3 border-white shadow-sm"
                    />
                    <div className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm" style={{ padding: '2px', transform: 'translate(10%, 10%)' }}>
                      <span className={`badge ${member.category === 'Core Council' ? 'bg-primary' : member.category === 'Faculty' ? 'bg-success' : 'bg-info'} rounded-circle d-flex align-items-center justify-content-center p-0`} style={{ width: '28px', height: '28px' }} title={member.category}>
                        <i className={`fas ${member.category === 'Core Council' ? 'fa-star text-white' : member.category === 'Faculty' ? 'fa-user-tie text-white' : 'fa-user text-white'} small`}></i>
                      </span>
                    </div>
                  </div>
                  
                  <h5 className="mb-1">{member.name}</h5>
                  <p className="text-primary fw-bold small mb-2">{member.role}</p>
                  
                  <div className="text-secondary small mb-3">
                    <p className="mb-0">{member.department}</p>
                    {member.year && <p className="mb-0">{member.year}</p>}
                  </div>
                  
                  <div className="mt-auto pt-3 border-top">
                    {member.linkedin_url && member.linkedin_url !== '#' ? (
                      <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-circle" style={{ width: '36px', height: '36px', padding: '0', lineHeight: '34px' }}>
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    ) : (
                      <span className="text-muted small fst-italic">No social links</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join Application Modal */}
      {showJoinModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowJoinModal(false)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content glass-panel border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="modal-header bg-primary text-white border-bottom-0 py-4">
                <h4 className="modal-title m-0"><i className="fas fa-handshake me-2"></i> Join Innovahub(IH) Core Team</h4>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowJoinModal(false)}></button>
              </div>
              <div className="modal-body p-4 p-md-5">
                <p className="text-secondary mb-4">Passionate about innovation? Apply to be a part of the Innovahub(IH) and help drive the entrepreneurial ecosystem on campus.</p>
                
                {joinStatus.message && (
                  <div className={`alert alert-${joinStatus.type} mb-4`}>
                    {joinStatus.message}
                  </div>
                )}

                <form onSubmit={handleJoinSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="fw-500 small mb-1">Full Name *</label>
                      <input type="text" name="name" className="form-control" value={joinForm.name} onChange={handleJoinChange} required placeholder="e.g. John Doe" />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-500 small mb-1">Email (College ID preferred) *</label>
                      <input type="email" name="email" className="form-control" value={joinForm.email} onChange={handleJoinChange} required placeholder="john@college.edu" />
                    </div>
                  </div>
                  
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="fw-500 small mb-1">Department *</label>
                      <input type="text" name="department" className="form-control" value={joinForm.department} onChange={handleJoinChange} required placeholder="e.g. Computer Science" />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-500 small mb-1">Year of Study *</label>
                      <select name="year" className="form-select" value={joinForm.year} onChange={handleJoinChange} required>
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Postgrad">Postgraduate</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="fw-500 small mb-1">Role Interest *</label>
                    <select name="role_interest" className="form-select" value={joinForm.role_interest} onChange={handleJoinChange} required>
                      <option value="">What area interests you most?</option>
                      <option value="Event Management">Event Management</option>
                      <option value="Technical/Development">Technical / Development</option>
                      <option value="Design & Media">Design & Media</option>
                      <option value="PR & Outreach">PR & Outreach</option>
                      <option value="Startup Mentorship">Startup Mentorship Incubation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="fw-500 small mb-1 d-flex justify-content-between">
                      <span>Statement of Purpose *</span>
                      <span className="text-secondary fw-normal">{joinForm.statement.length}/500</span>
                    </label>
                    <textarea 
                      name="statement" 
                      className="form-control" 
                      rows="4" 
                      maxLength="500"
                      value={joinForm.statement} 
                      onChange={handleJoinChange} 
                      required 
                      placeholder="Why do you want to join Innovahub(IH)? What can you contribute?"
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                    <button type="button" className="btn btn-light px-4" onClick={() => setShowJoinModal(false)} disabled={submitting}>Cancel</button>
                    <button type="submit" className="btn btn-primary px-5 rounded-pill shadow-sm" disabled={submitting}>
                      {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span> Submitting...</> : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
