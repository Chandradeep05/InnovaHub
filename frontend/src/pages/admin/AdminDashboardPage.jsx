import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    eventsCount: 0,
    visitors: 1245,
    registrations: 84,
    queries: 3
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    
    if (!token || !userStr) {
      navigate('/admin/login');
      return;
    }
    setAdmin(JSON.parse(userStr));

    // Fetch stats (Dummy fallback if backend fails)
    fetch(`${API_URL}/api/events`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStats(prev => ({ ...prev, eventsCount: data.length }));
        }
      })
      .catch(err => {
        setStats(prev => ({ ...prev, eventsCount: 12 })); // Dummy fallback
      });
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };

  if (!admin) return <div className="d-flex justify-content-center align-items-center min-h-screen"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="admin-page section min-h-screen bg-light position-relative overflow-hidden w-100 h-100" style={{ padding: '0', minHeight: '100vh' }}>
      
      {/* Decorative Blob */}
      <div className="position-absolute top-0 end-0 bg-primary opacity-10 rounded-circle" style={{ width: '400px', height: '400px', filter: 'blur(50px)', transform: 'translate(40%, -40%)', zIndex: 0 }}></div>

      <div className="container py-5 position-relative" style={{ zIndex: 1, maxWidth: '1400px' }}>
        
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 bg-white p-4 rounded-4 shadow-sm border-0">
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <div className="avatar bg-gradient-primary text-white rounded-circle d-flex justify-content-center align-items-center shadow p-2 me-3" style={{ width: '60px', height: '60px', background: 'linear-gradient(45deg, #4e73df, #224abe)' }}>
              <span className="fs-3 fw-bold">{admin.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="mb-0 fw-bold">Admin Portal</h2>
              <p className="text-secondary mb-0">Welcome back, <span className="text-primary fw-bold">{admin.name}</span>! System is running smoothly.</p>
            </div>
          </div>
          <div>
            <button className="btn btn-outline-danger rounded-pill px-4 shadow-sm hover-lift" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt me-2"></i> Log Out
            </button>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="row g-4 mb-5">
          {[
            { title: 'Total Events', val: stats.eventsCount, icon: 'fa-calendar-check', color: '#4e73df', bg: 'rgba(78, 115, 223, 0.1)' },
            { title: 'Active Ideas', val: 42, icon: 'fa-lightbulb', color: '#1cc88a', bg: 'rgba(28, 200, 138, 0.1)' },
            { title: 'Event Registrations', val: stats.registrations, icon: 'fa-ticket-alt', color: '#f6c23e', bg: 'rgba(246, 194, 62, 0.1)' },
            { title: 'Pending Queries', val: stats.queries, icon: 'fa-comments', color: '#e74a3b', bg: 'rgba(231, 74, 59, 0.1)' }
          ].map((stat, idx) => (
            <div key={idx} className="col-sm-6 col-lg-3">
              <div className="glass-card border-0 rounded-4 p-4 d-flex align-items-center justify-content-between h-100 hover-lift transition-all shadow-sm" style={{ borderLeft: `5px solid ${stat.color} !important`, backgroundColor: '#fff' }}>
                <div>
                  <p className="text-uppercase fw-bold text-secondary mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>{stat.title}</p>
                  <h3 className="fw-bolder mb-0 text-dark" style={{ fontSize: '2rem' }}>{stat.val}</h3>
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', backgroundColor: stat.bg, color: stat.color }}>
                  <i className={`fas ${stat.icon} fs-3`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="bg-white rounded-4 shadow-sm p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h4 className="fw-bold m-0"><i className="fas fa-rocket text-primary me-2"></i> Quick Mission Control</h4>
              </div>
              
              <div className="row g-3">
                {[
                  { label: 'Manage Events', path: '/admin/events/add', icon: 'fa-calendar-plus', color: 'primary' },
                  { label: 'Review Ideas', path: '/admin/ideas', icon: 'fa-brain', color: 'success' },
                  { label: 'Email Hub', path: '/admin/emails', icon: 'fa-paper-plane', color: 'info' },
                  { label: 'Doc Engine', path: '/admin/doc', icon: 'fa-file-pdf', color: 'primary' },
                  { label: 'Gallery Uploads', path: '/admin/gallery', icon: 'fa-images', color: 'warning' },
                  { label: 'Council Members', path: '/admin/members', icon: 'fa-users-cog', color: 'secondary' },
                  { label: 'Answer Queries', path: '/admin/queries', icon: 'fa-headset', color: 'danger' }
                ].map((action, idx) => (
                  <div key={idx} className="col-md-4 col-sm-6">
                    <button 
                      onClick={() => navigate(action.path)}
                      className={`btn w-100 text-start p-3 rounded-4 shadow-sm border-0 bg-${action.color}-subtle text-${action.color} hover-lift`}
                      style={{ transition: 'all 0.3s' }}
                    >
                      <div className="d-flex align-items-center">
                        <div className={`bg-${action.color} text-white rounded p-2 me-3 shadow-sm d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
                          <i className={`fas ${action.icon}`}></i>
                        </div>
                        <span className="fw-bold">{action.label}</span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="bg-gradient-primary text-white rounded-4 shadow-sm p-4 h-100" style={{ background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)' }}>
              <h4 className="fw-bold mb-4 border-bottom border-light pb-3"><i className="fas fa-bolt text-warning me-2"></i> Recent Activity</h4>
              <div className="activity-feed position-relative ps-4 ms-2" style={{ borderLeft: '2px solid rgba(255,255,255,0.3)' }}>
                {[
                  { text: 'New idea pitched: "AI Drone Delivery"', time: '10 mins ago', icon: 'fa-lightbulb', color: 'text-warning' },
                  { text: 'Event "Hackathon 2026" reached 50 signups', time: '1 hr ago', icon: 'fa-users', color: 'text-info' },
                  { text: 'System backup completed successfully', time: '5 hrs ago', icon: 'fa-server', color: 'text-success' },
                  { text: 'New query from Jane Student', time: '1 day ago', icon: 'fa-envelope', color: 'text-light' }
                ].map((item, i) => (
                  <div key={i} className="mb-4 position-relative">
                    <span className="position-absolute start-0 translate-middle" style={{ left: '-1px' }}>
                      <i className={`fas ${item.icon} ${item.color} bg-white rounded-circle p-1 shadow-sm`} style={{ fontSize: '0.8rem' }}></i>
                    </span>
                    <p className="mb-1 text-white opacity-100">{item.text}</p>
                    <small className="text-white opacity-75">{item.time}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
