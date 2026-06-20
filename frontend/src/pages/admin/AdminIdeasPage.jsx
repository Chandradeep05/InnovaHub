import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminIdeasPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending', 'Approved', 'Rejected'
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    if (!token || !userStr) {
      navigate('/admin/login');
      return;
    }
    fetchIdeas();
  }, [navigate]);

  const fetchIdeas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/ideas`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch ideas');
      const data = await response.json();
      setIdeas(data);
    } catch (err) {
      // Dummy data fallback for UI testing
      setIdeas([
        { id: 1, tracking_id: 'IH-IDEA-2041', submitted_at: new Date().toISOString(), student_name: 'Rahul Desai', email: 'rahul@student.edu', title: 'AI-Powered Campus Guide', category: 'Software / IT', pitch_deck_url: '#', status: 'Pending' },
        { id: 2, tracking_id: 'IH-IDEA-2042', submitted_at: new Date(Date.now() - 86400000).toISOString(), student_name: 'Priya Sharma', email: 'priya@alumni.edu', title: 'Biodegradable Packaging', category: 'Environment', pitch_deck_url: '#', status: 'Approved' },
        { id: 3, tracking_id: 'IH-IDEA-2043', submitted_at: new Date(Date.now() - 172800000).toISOString(), student_name: 'Alex Johnson', email: 'alex@student.edu', title: 'Smart Energy Metering', category: 'IoT / Hardware', pitch_deck_url: '#', status: 'Pending' },
        { id: 4, tracking_id: 'IH-IDEA-2044', submitted_at: new Date(Date.now() - 259200000).toISOString(), student_name: 'Neha Gupta', email: 'neha@dept.edu', title: 'AR Library Books', category: 'EdTech', pitch_deck_url: null, status: 'Rejected' },
      ]);
      setError('Using local dummy data: Backend unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setIdeas(ideas.map(idea => idea.id === id ? { ...idea, status: newStatus } : idea));
  };

  const filteredIdeas = ideas.filter(idea => idea.status === activeTab);

  return (
    <div className="admin-page section bg-light min-h-screen py-5 px-3 px-lg-5" style={{ minHeight: '100vh' }}>
      <div className="container-fluid" style={{ maxWidth: '1400px' }}>
        
        {/* Header Area */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 bg-white p-4 rounded-4 shadow-sm border-0">
          <div>
            <h2 className="mb-1 fw-bold"><i className="fas fa-lightbulb text-warning me-2"></i> Idea Submissions</h2>
            <p className="text-secondary small mb-0">Review student pitches, approve incubation requests, and manage the Innovation Hub.</p>
          </div>
          <div className="mt-3 mt-md-0">
            <button className="btn btn-outline-primary rounded-pill px-4 shadow-sm" onClick={() => fetchIdeas()}><i className="fas fa-sync-alt me-2"></i> Refresh Data</button>
          </div>
        </div>

        {error && <div className="alert alert-warning border-0 shadow-sm rounded-4 mb-4"><i className="fas fa-exclamation-triangle me-2"></i> {error}</div>}

        {/* Tab Filters */}
        <div className="bg-white p-2 rounded-pill shadow-sm d-inline-flex mb-4 flex-wrap gap-1">
          {['Pending', 'Approved', 'Rejected'].map(status => (
            <button 
              key={status}
              className={`btn rounded-pill px-4 py-2 ${activeTab === status ? (status === 'Pending' ? 'btn-warning text-dark shadow' : status === 'Approved' ? 'btn-success text-white shadow' : 'btn-danger text-white shadow') : 'btn-transparent text-secondary'}`} 
              onClick={() => setActiveTab(status)}
            >
              <i className={`fas fa-${status === 'Pending' ? 'clock' : status === 'Approved' ? 'check-circle' : 'times-circle'} me-2`}></i> 
              {status} ({ideas.filter(i => i.status === status).length})
            </button>
          ))}
        </div>

        {/* Idea Grid */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary fs-3"></div></div>
        ) : filteredIdeas.length === 0 ? (
          <div className="bg-white rounded-5 shadow-sm text-center p-5 mt-3 border-0">
            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '100px', height: '100px' }}>
              <i className="fas fa-box-open text-secondary" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
            </div>
            <h4 className="fw-bold text-dark">No {activeTab} Ideas</h4>
            <p className="text-secondary mb-0">All clear here! Check back later for new student submissions.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredIdeas.map((idea) => (
              <div key={idea.id} className="col-md-6 col-xl-4">
                <div className="glass-card position-relative border-0 rounded-4 p-4 h-100 shadow-sm hover-lift d-flex flex-column" style={{ borderTop: `5px solid ${idea.status === 'Pending' ? 'var(--warning)' : idea.status === 'Approved' ? 'var(--success)' : 'var(--danger)'} !important` }}>
                  
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="badge bg-light text-dark border px-2 py-1"><i className="fas fa-tag me-1 text-primary"></i> {idea.category}</span>
                    <span className="small text-secondary fw-bold">{idea.tracking_id}</span>
                  </div>
                  
                  <h5 className="fw-bold mb-3 text-dark lh-base">{idea.title}</h5>
                  
                  <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                    <div className="avatar bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0 fw-bold fs-6" style={{ width: '40px', height: '40px' }}>
                      {idea.student_name.charAt(0)}
                    </div>
                    <div>
                      <div className="fw-500 small text-dark mb-0">{idea.student_name}</div>
                      <div className="small text-secondary">{idea.email}</div>
                    </div>
                  </div>

                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <div>
                      {idea.pitch_deck_url ? (
                        <a href={idea.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill shadow-sm">
                          <i className="fas fa-file-pdf me-1"></i> View Deck
                        </a>
                      ) : (
                        <span className="text-muted small fst-italic"><i className="fas fa-eye-slash me-1"></i> No Pitch Deck</span>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                       {idea.status !== 'Approved' && (
                         <button className="btn btn-sm btn-success rounded-circle shadow-sm" style={{ width: '36px', height: '36px', padding: 0 }} title="Approve" onClick={() => handleStatusChange(idea.id, 'Approved')}>
                           <i className="fas fa-check"></i>
                         </button>
                       )}
                       {idea.status !== 'Rejected' && (
                         <button className="btn btn-sm btn-danger rounded-circle shadow-sm" style={{ width: '36px', height: '36px', padding: 0 }} title="Reject" onClick={() => handleStatusChange(idea.id, 'Rejected')}>
                           <i className="fas fa-times"></i>
                         </button>
                       )}
                       {idea.status !== 'Pending' && (
                         <button className="btn btn-sm btn-warning text-dark rounded-circle shadow-sm" style={{ width: '36px', height: '36px', padding: 0 }} title="Revert to Pending" onClick={() => handleStatusChange(idea.id, 'Pending')}>
                           <i className="fas fa-undo"></i>
                         </button>
                       )}
                    </div>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminIdeasPage;
