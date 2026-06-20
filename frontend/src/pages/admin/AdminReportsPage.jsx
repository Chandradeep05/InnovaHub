import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', report_type: 'Annual Report', event_name: '', year: new Date().getFullYear(), pdf_url: '', file_size: '1.5 MB'
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchReports();
  }, [navigate]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reports`);
      if (!res.ok) throw new Error('Failed to fetch');
      setReports(await res.json());
    } catch (err) { 
        // Dummy data for frontend UI test
        setReports([
            { id: 1, title: 'Innovahub(IH) Annual Report 2023-24', description: 'Comprehensive coverage of all events and initiatives.', report_type: 'Annual Report', year: 2024, file_size: '4.2 MB', pdf_url: '#' },
            { id: 2, title: 'Hackathon Impact Summary', description: 'Participant metrics and winning ideas.', report_type: 'Event Summary', event_name: 'HackAI 24', year: 2024, file_size: '1.1 MB', pdf_url: '#' },
            { id: 3, title: 'Q1 Financial Disclosures', description: 'Budget utilization for the first quarter.', report_type: 'Financials', year: 2024, file_size: '800 KB', pdf_url: '#' },
        ]);
        setError('Simulating data: Backend unreachable'); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to add report');
      setShowForm(false);
      setFormData({ title: '', description: '', report_type: 'Annual Report', event_name: '', year: new Date().getFullYear(), pdf_url: '', file_size: '1.5 MB' });
      fetchReports();
    } catch (err) { 
        const newReport = { id: Date.now(), ...formData };
        setReports([newReport, ...reports]);
        setShowForm(false);
        setFormData({ title: '', description: '', report_type: 'Annual Report', event_name: '', year: new Date().getFullYear(), pdf_url: '', file_size: '1.5 MB' });
    }
  };

  const getIconForType = (type) => {
      switch(type) {
          case 'Annual Report': return 'fa-book';
          case 'Financials': return 'fa-chart-pie';
          default: return 'fa-file-invoice';
      }
  };

  const handleDelete = (id) => {
      if(window.confirm('Delete this report document?')) {
          setReports(reports.filter(r => r.id !== id));
      }
  };

  return (
    <div className="admin-page section bg-light min-h-screen py-5 px-3 px-lg-5" style={{ minHeight: '100vh' }}>
      <div className="container-fluid" style={{ maxWidth: '1400px' }}>
        
        {/* Header Area */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 bg-white p-4 rounded-4 shadow-sm border-0">
          <div>
            <h2 className="mb-1 fw-bold"><i className="fas fa-file-pdf text-danger me-2"></i> Documents Library</h2>
            <p className="text-secondary small mb-0">Upload official PDFs, annual reports, and event summaries.</p>
          </div>
          <div className="mt-3 mt-md-0 d-flex gap-2">
            <button className={`btn ${showForm ? 'btn-secondary' : 'btn-danger'} rounded-pill px-4 shadow-sm`} onClick={() => setShowForm(!showForm)}>
              <i className={`fas fa-${showForm ? 'times' : 'cloud-upload-alt'} me-2`}></i> {showForm ? 'Cancel Upload' : 'Upload Document'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-warning border-0 shadow-sm rounded-4 mb-4"><i className="fas fa-exclamation-triangle me-2"></i> {error}</div>}

        {/* Form Area */}
        {showForm && (
          <div className="glass-card p-4 p-md-5 mb-5 rounded-4 shadow-lg border-danger border-top border-5 animate-fade-in bg-white">
            <h4 className="fw-bold mb-4">Upload New Document</h4>
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold mb-1">Document Title</label>
                  <input type="text" className="form-control bg-light border-0" placeholder="e.g. Q1 Summary" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} required/>
                </div>
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold mb-1">Document Type</label>
                  <select className="form-select bg-light border-0" value={formData.report_type} onChange={e=>setFormData({...formData, report_type: e.target.value})}>
                    <option>Annual Report</option>
                    <option>Event Summary</option>
                    <option>Financials</option>
                    <option>Policy/Guidelines</option>
                  </select>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="small text-secondary fw-bold mb-1">Year</label>
                  <input type="number" className="form-control bg-light border-0" value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})} required/>
                </div>
                <div className="col-md-4">
                  <label className="small text-secondary fw-bold mb-1">Associated Event (Optional)</label>
                  <input type="text" className="form-control bg-light border-0" placeholder="e.g. Hackathon" value={formData.event_name} onChange={e=>setFormData({...formData, event_name: e.target.value})}/>
                </div>
                <div className="col-md-4">
                  <label className="small text-secondary fw-bold mb-1">File Size Label</label>
                  <input type="text" className="form-control bg-light border-0" placeholder="e.g. 2.4 MB" value={formData.file_size} onChange={e=>setFormData({...formData, file_size: e.target.value})}/>
                </div>
              </div>
              <div className="row g-3 mb-4">
                <div className="col-md-12">
                  <label className="small text-secondary fw-bold mb-1">PDF URL</label>
                  <input type="url" className="form-control bg-light border-0" placeholder="https://..." value={formData.pdf_url} onChange={e=>setFormData({...formData, pdf_url: e.target.value})} required/>
                </div>
                <div className="col-md-12 mt-3">
                  <label className="small text-secondary fw-bold mb-1">Short Description</label>
                  <textarea className="form-control bg-light border-0" rows="3" placeholder="What does this document contain?" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
                </div>
              </div>
              <button type="submit" className="btn btn-danger px-5 rounded-pill shadow-sm"><i className="fas fa-file-pdf me-2"></i> Save Document</button>
            </form>
          </div>
        )}

        {/* Document Cards */}
        {loading ? (
             <div className="text-center py-5"><div className="spinner-border text-danger fs-3"></div></div>
        ) : reports.length === 0 ? (
            <div className="bg-white rounded-5 shadow-sm text-center p-5 mt-3 border-0">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '100px', height: '100px' }}>
                <i className="fas fa-folder-open text-secondary" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                </div>
                <h4 className="fw-bold text-dark">Library Empty</h4>
                <p className="text-secondary mb-0">Upload official documents above.</p>
            </div>
        ) : (
            <div className="row g-4">
              {reports.map((r, idx) => (
                <div key={r.id || idx} className="col-md-6 col-xl-4">
                  <div className="glass-card position-relative border-0 rounded-4 p-4 h-100 shadow-sm hover-lift d-flex flex-column" style={{ borderTop: `4px solid var(--danger)` }}>
                    <div className="d-flex align-items-start mb-3">
                        <div className="bg-danger-subtle text-danger rounded p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                            <i className={`fas ${getIconForType(r.report_type)} fs-3`}></i>
                        </div>
                        <div className="flex-grow-1">
                            <h5 className="fw-bold mb-1 lh-sm text-dark">{r.title}</h5>
                            <span className="badge bg-light text-dark border px-2 py-1">{r.report_type}</span>
                        </div>
                    </div>
                    
                    <p className="text-secondary small mb-4 flex-grow-1">{r.description || 'No description provided.'}</p>
                    
                    <div className="d-flex justify-content-between align-items-center mt-auto border-top pt-3">
                        <div className="small text-muted fw-500">
                            <i className="fas fa-calendar-alt me-1"></i> {r.year} 
                            <span className="mx-2">•</span> 
                            <i className="fas fa-hdd me-1"></i> {r.file_size || 'PDF'}
                        </div>
                        <div className="d-flex gap-2">
                             <a href={r.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-danger rounded-circle shadow-sm" style={{ width: '35px', height: '35px', padding: 0 }} title="Preview Document">
                               <i className="fas fa-eye"></i>
                             </a>
                             <button className="btn btn-sm btn-danger text-white rounded-circle shadow-sm" style={{ width: '35px', height: '35px', padding: 0 }} title="Delete" onClick={() => handleDelete(r.id)}>
                               <i className="fas fa-trash"></i>
                             </button>
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

export default AdminReportsPage;
