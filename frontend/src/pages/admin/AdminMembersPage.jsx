import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', role: '', department: '', year: '', email: '', linkedin_url: '', is_faculty: false, is_active: true, photo_url: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchMembers();
  }, [navigate]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/members`);
      if (!res.ok) throw new Error('Failed to fetch');
      setMembers(await res.json());
    } catch (err) { 
      // Dummy data fallback
      setMembers([
        { id: 1, name: 'Dr. John Doe', email: 'john@college.edu', role: 'President', department: 'Computer Science', is_faculty: true, is_active: true, photo_url: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Jane Smith', email: 'jane@student.edu', role: 'Student Coordinator', department: 'IT', year: '3rd Year', is_faculty: false, is_active: true, photo_url: 'https://via.placeholder.com/150' },
        { id: 3, name: 'Alan Turing', email: 'alan@alumni.edu', role: 'Alumni Advisor', department: 'AI', is_faculty: false, is_active: false, photo_url: '' },
      ]);
      setError('Using dummy data (Backend Unreachable)'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to add member');
      setShowForm(false);
      setFormData({ name: '', role: '', department: '', year: '', email: '', linkedin_url: '', is_faculty: false, is_active: true, photo_url: '' });
      fetchMembers();
    } catch (err) { 
      // Locally push to state for demo
      setMembers([...members, { id: Date.now(), ...formData }]);
      setShowForm(false);
      setFormData({ name: '', role: '', department: '', year: '', email: '', linkedin_url: '', is_faculty: false, is_active: true, photo_url: '' });
    }
  };

  const toggleStatus = (id) => {
    setMembers(members.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m));
  };

  return (
    <div className="admin-page section bg-light min-h-screen py-5 px-3 px-lg-5" style={{ minHeight: '100vh' }}>
      <div className="container-fluid" style={{ maxWidth: '1400px' }}>
        
        {/* Header Area */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 bg-white p-4 rounded-4 shadow-sm border-0">
          <div>
            <h2 className="mb-1 fw-bold"><i className="fas fa-users-cog text-primary me-2"></i> Council Roster</h2>
            <p className="text-secondary small mb-0">Manage IIC team members, approve roles, and update student/faculty status.</p>
          </div>
          <div className="mt-3 mt-md-0 d-flex gap-2">
            <button className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'} rounded-pill px-4 shadow-sm`} onClick={() => setShowForm(!showForm)}>
              <i className={`fas fa-${showForm ? 'times' : 'plus'} me-2`}></i> {showForm ? 'Cancel' : 'New Member'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-warning border-0 shadow-sm rounded-4 mb-4"><i className="fas fa-exclamation-triangle me-2"></i> {error}</div>}

        {/* Add Member Form */}
        {showForm && (
          <div className="glass-card p-4 p-md-5 mb-5 rounded-4 shadow-lg border-primary border-top border-5 animate-fade-in bg-white">
            <h4 className="fw-bold mb-4">Add Profile</h4>
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold mb-1">Full Name</label>
                  <input type="text" className="form-control bg-light border-0" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required/>
                </div>
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold mb-1">Email</label>
                  <input type="email" className="form-control bg-light border-0" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required/>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="small text-secondary fw-bold mb-1">Assigned Role</label>
                  <input type="text" className="form-control bg-light border-0" placeholder="e.g. Vice President" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} required/>
                </div>
                <div className="col-md-4">
                  <label className="small text-secondary fw-bold mb-1">Department</label>
                  <input type="text" className="form-control bg-light border-0" value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} required/>
                </div>
                <div className="col-md-4">
                  <label className="small text-secondary fw-bold mb-1">Year (Optional)</label>
                  <input type="text" className="form-control bg-light border-0" placeholder="e.g. 3rd Year" value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})}/>
                </div>
              </div>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold mb-1">LinkedIn URL</label>
                  <input type="url" className="form-control bg-light border-0" placeholder="https://" value={formData.linkedin_url} onChange={e=>setFormData({...formData, linkedin_url: e.target.value})}/>
                </div>
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold mb-1">Photo URL</label>
                  <input type="url" className="form-control bg-light border-0" placeholder="https://" value={formData.photo_url} onChange={e=>setFormData({...formData, photo_url: e.target.value})}/>
                </div>
              </div>
              <div className="d-flex gap-4 mb-4 p-3 bg-light rounded-3">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="facultySwitch" checked={formData.is_faculty} onChange={e=>setFormData({...formData, is_faculty: e.target.checked})}/>
                  <label className="form-check-label fw-500" htmlFor="facultySwitch">Is Faculty?</label>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="activeSwitch" checked={formData.is_active} onChange={e=>setFormData({...formData, is_active: e.target.checked})}/>
                  <label className="form-check-label fw-500" htmlFor="activeSwitch">Active Profile</label>
                </div>
              </div>
              <button type="submit" className="btn btn-primary px-5 rounded-pill shadow-sm">Save Member to DB</button>
            </form>
          </div>
        )}

        {/* Members Grid */}
        <div className="row g-4">
          {members.map(m => (
            <div key={m.id} className="col-md-6 col-xl-4 col-xxl-3">
              <div className={`glass-card p-4 rounded-4 text-center h-100 position-relative transition-all hover-lift ${!m.is_active ? 'opacity-75' : ''}`} style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)' }}>
                
                <div className="position-absolute top-0 end-0 m-3 d-flex gap-2">
                  <span className={`badge ${m.is_faculty ? 'bg-info-subtle text-info' : 'bg-primary-subtle text-primary'} border px-2 py-1 rounded-pill`}>
                    {m.is_faculty ? 'Faculty' : 'Student'}
                  </span>
                </div>

                <div className="mx-auto mb-3 mt-2 position-relative" style={{ width: '90px', height: '90px' }}>
                  <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`} alt={m.name} className="rounded-circle w-100 h-100 object-fit-cover shadow-sm border border-3 border-light" />
                  <div className={`position-absolute bottom-0 end-0 rounded-circle ${m.is_active ? 'bg-success' : 'bg-danger'} border border-2 border-white`} style={{ width: '16px', height: '16px', transform: 'translate(-5px, -5px)', title: m.is_active ? 'Active' : 'Inactive' }}></div>
                </div>

                <h5 className="fw-bold text-dark mb-1">{m.name}</h5>
                <p className="text-primary fw-500 small mb-2">{m.role}</p>

                <div className="text-secondary small mb-3 bg-light p-2 rounded-3">
                  <div>{m.department}</div>
                  {m.year && <div>{m.year}</div>}
                  <div className="text-truncate mt-1" title={m.email}><i className="fas fa-envelope text-muted me-1"></i> {m.email}</div>
                </div>

                <button 
                  className={`btn btn-sm w-100 rounded-pill ${m.is_active ? 'btn-outline-danger' : 'btn-outline-success'} shadow-none`}
                  onClick={() => toggleStatus(m.id)}
                >
                  <i className={`fas fa-${m.is_active ? 'user-slash' : 'user-check'} me-1`}></i>
                  {m.is_active ? 'Deactivate' : 'Activate'}
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminMembersPage;
