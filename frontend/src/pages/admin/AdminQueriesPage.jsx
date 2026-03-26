import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminQueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending' or 'Resolved'
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    if (!token || !userStr) {
      navigate('/admin/login');
      return;
    }
    fetchQueries();
  }, [navigate]);

  const fetchQueries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/queries', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch queries');
      const data = await response.json();
      setQueries(data);
    } catch (err) {
      // Dummy data fallback for UI testing
      setQueries([
        { id: 1, query_id: 'IIC-1042', submitted_at: new Date().toISOString(), name: 'Alex Johnson', email: 'alex@student.edu', subject: 'Event Registration Issue', message: 'I cannot register for upcoming Hackathon.', status: 'Pending' },
        { id: 2, query_id: 'IIC-1043', submitted_at: new Date(Date.now() - 86400000).toISOString(), name: 'Priya Sharma', email: 'priya@alumni.edu', subject: 'Collaboration Proposal', message: 'I would like to sponsor an event.', status: 'Pending' },
        { id: 3, query_id: 'IIC-1044', submitted_at: new Date(Date.now() - 172800000).toISOString(), name: 'Rahul Desai', email: 'rahul@student.edu', subject: 'Idea Submission Query', message: 'Does my pitch need a prototype?', status: 'Resolved' },
      ]);
      setError('Using local dummy data: Backend unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = (id) => {
    // Toggle resolve status locally for demo
    setQueries(queries.map(q => q.id === id ? { ...q, status: q.status === 'Pending' ? 'Resolved' : 'Pending' } : q));
  };

  const filteredQueries = queries.filter(q => q.status === activeTab);

  return (
    <div className="admin-page section bg-light min-h-screen py-5 px-3 px-lg-5" style={{ minHeight: '100vh' }}>
      <div className="container-fluid" style={{ maxWidth: '1400px' }}>
        
        {/* Header Area */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 bg-white p-4 rounded-4 shadow-sm border-0">
          <div>
            <h2 className="mb-1 fw-bold"><i className="fas fa-headset text-primary me-2"></i> Query Management Hub</h2>
            <p className="text-secondary small mb-0">Review, reply, and resolve messages submitted via the Contact Us page.</p>
          </div>
          <div className="mt-3 mt-md-0 d-flex gap-2">
            <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => fetchQueries()}><i className="fas fa-sync-alt me-2"></i> Sync Now</button>
            <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => navigate('/admin/emails')}><i className="fas fa-paper-plane me-2"></i> Email Hub</button>
          </div>
        </div>

        {error && <div className="alert alert-warning border-0 shadow-sm rounded-4 mb-4"><i className="fas fa-exclamation-triangle me-2"></i> {error}</div>}

        {/* Tab Filters */}
        <div className="bg-white p-2 rounded-pill shadow-sm d-inline-flex mb-4">
          <button className={`btn rounded-pill px-4 py-2 ${activeTab === 'Pending' ? 'btn-primary shadow' : 'btn-transparent text-secondary'}`} onClick={() => setActiveTab('Pending')}>
            <i className="fas fa-clock me-2"></i> Pending ({queries.filter(q => q.status === 'Pending').length})
          </button>
          <button className={`btn rounded-pill px-4 py-2 ${activeTab === 'Resolved' ? 'btn-success shadow text-white' : 'btn-transparent text-secondary'}`} onClick={() => setActiveTab('Resolved')}>
            <i className="fas fa-check-circle me-2"></i> Resolved ({queries.filter(q => q.status === 'Resolved').length})
          </button>
        </div>

        {/* Query List Stream */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary fs-3"></div></div>
        ) : filteredQueries.length === 0 ? (
          <div className="bg-white rounded-5 shadow-sm text-center p-5 mt-3 border-0">
            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '100px', height: '100px' }}>
              <i className="fas fa-inbox text-secondary" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
            </div>
            <h4 className="fw-bold text-dark">Inbox Zero!</h4>
            <p className="text-secondary mb-0">You have no {activeTab.toLowerCase()} queries at this time.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredQueries.map((q) => (
              <div key={q.id} className="col-12">
                <div className="bg-white rounded-4 shadow-sm border-0 position-relative hover-lift transition-all p-4" style={{ borderLeft: `6px solid ${q.status === 'Pending' ? 'var(--warning)' : 'var(--success)'} !important` }}>
                  <div className="row align-items-center">
                    
                    {/* User Info col */}
                    <div className="col-md-3 mb-3 mb-md-0">
                      <div className="d-flex align-items-center">
                        <div className="avatar bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0 fw-bold fs-5" style={{ width: '50px', height: '50px' }}>
                          {q.name.charAt(0)}
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0 text-dark">{q.name}</h6>
                          <span className="small text-secondary"><i className="fas fa-envelope me-1"></i> {q.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta Info col */}
                    <div className="col-md-2 mb-3 mb-md-0 border-end border-start px-md-4">
                      <div className="small text-secondary mb-1">Tracking ID</div>
                      <div className="fw-bold text-dark"><kbd className="bg-light text-dark fw-bold border">{q.query_id}</kbd></div>
                      <div className="small text-secondary mt-2"><i className="far fa-calendar-alt me-1"></i> {new Date(q.submitted_at).toLocaleDateString()}</div>
                    </div>

                    {/* Subject & Message col */}
                    <div className="col-md-5 mb-3 mb-md-0 px-md-4">
                      <h6 className="fw-bold text-dark mb-2"><i className="fas fa-tag text-primary me-2"></i> {q.subject}</h6>
                      <p className="text-secondary small mb-0 p-2 bg-light rounded-3" style={{ maxHeight: '60px', overflowY: 'auto' }}>"{q.message}"</p>
                    </div>

                    {/* Actions col */}
                    <div className="col-md-2 text-md-end">
                      <span className={`badge bg-${q.status === 'Pending' ? 'warning text-dark' : 'success'} rounded-pill px-3 py-2 mb-3 d-inline-block shadow-sm`}>
                        <i className={`fas fa-${q.status === 'Pending' ? 'clock' : 'check'} me-1`}></i> {q.status}
                      </span>
                      <div className="d-flex justify-content-md-end gap-2">
                        <button className="btn btn-sm btn-outline-primary rounded-circle" style={{ width: '35px', height: '35px', padding: 0 }} title="Reply via Email" onClick={() => navigate('/admin/emails')}>
                          <i className="fas fa-reply"></i>
                        </button>
                        <button 
                          className={`btn btn-sm ${q.status === 'Pending' ? 'btn-success text-white' : 'btn-outline-secondary'} rounded-circle`} 
                          style={{ width: '35px', height: '35px', padding: 0 }} 
                          title="Mark action"
                          onClick={() => handleResolve(q.id)}
                        >
                          <i className={`fas fa-${q.status === 'Pending' ? 'check-double' : 'undo'}`}></i>
                        </button>
                      </div>
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

export default AdminQueriesPage;
