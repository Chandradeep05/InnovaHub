import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DocEnginePage = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState({});
  const [campaigns, setCampaigns] = useState({});
  const [expandedWs, setExpandedWs] = useState(null);
  const [expandedProj, setExpandedProj] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewWs, setShowNewWs] = useState(false);
  const [showNewProj, setShowNewProj] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const token = localStorage.getItem('adminToken');

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { navigate('/admin/login'); return; }
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch(`${API_URL}/api/doc/workspaces`, { headers });
      const data = await res.json();
      setWorkspaces(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchProjects = async (wsId) => {
    const res = await fetch(`${API_URL}/api/doc/projects/${wsId}`, { headers });
    const data = await res.json();
    setProjects(prev => ({ ...prev, [wsId]: data || [] }));
  };

  const fetchCampaigns = async (projId) => {
    const res = await fetch(`${API_URL}/api/doc/campaigns/project/${projId}`, { headers });
    const data = await res.json();
    setCampaigns(prev => ({ ...prev, [projId]: data || [] }));
  };

  const createWorkspace = async () => {
    if (!newName.trim()) return;
    await fetch(`${API_URL}/api/doc/workspaces`, { method: 'POST', headers, body: JSON.stringify({ name: newName }) });
    setNewName(''); setShowNewWs(false); fetchWorkspaces();
  };

  const createProject = async (wsId) => {
    if (!newName.trim()) return;
    await fetch(`${API_URL}/api/doc/projects`, { method: 'POST', headers, body: JSON.stringify({ workspace_id: wsId, name: newName, description: newDesc }) });
    setNewName(''); setNewDesc(''); setShowNewProj(null); fetchProjects(wsId);
  };

  const toggleWorkspace = (wsId) => {
    if (expandedWs === wsId) { setExpandedWs(null); return; }
    setExpandedWs(wsId);
    if (!projects[wsId]) fetchProjects(wsId);
  };

  const toggleProject = (projId) => {
    if (expandedProj === projId) { setExpandedProj(null); return; }
    setExpandedProj(projId);
    if (!campaigns[projId]) fetchCampaigns(projId);
  };

  const statusBadge = (status) => {
    const map = { draft: 'badge-info', sending: 'badge-warning', completed: 'badge-success', failed: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  if (loading) return (
    <div className="admin-page container section min-h-screen" style={{ paddingTop: '6rem' }}>
      <div className="text-center p-5"><span className="spinner-border"></span></div>
    </div>
  );

  return (
    <div className="admin-page container section min-h-screen" style={{ paddingTop: '6rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>
            <i className="fas fa-file-pdf me-2" style={{ color: 'var(--accent-primary)' }}></i>
            Document Engine
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Generate certificates, letters & documents — then email them in bulk
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-glass btn-sm" onClick={() => setShowNewWs(true)}>
            <i className="fas fa-plus me-1"></i> New Workspace
          </button>
          <Link to="/admin/dashboard" className="btn btn-glass btn-sm">
            <i className="fas fa-arrow-left me-1"></i> Dashboard
          </Link>
        </div>
      </div>

      {/* New Workspace Form */}
      {showNewWs && (
        <div className="glass-card p-3 mb-3 animate-fade-in" style={{ maxWidth: '500px' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input className="form-control" placeholder="Workspace name (e.g. InnovaHub, CSI Society)" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createWorkspace()} autoFocus />
            <button className="btn btn-primary btn-sm" onClick={createWorkspace}>Create</button>
            <button className="btn btn-glass btn-sm" onClick={() => { setShowNewWs(false); setNewName(''); }}>✕</button>
          </div>
        </div>
      )}

      {/* Workspace Tree */}
      {workspaces.length === 0 ? (
        <div className="glass-panel text-center p-5">
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📁</div>
          <h4>No workspaces yet</h4>
          <p style={{ color: 'var(--text-secondary)' }}>Create your first workspace to start generating documents.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewWs(true)}>
            <i className="fas fa-plus me-1"></i> Create Workspace
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {workspaces.map(ws => (
            <div key={ws.id} className="glass-card" style={{ overflow: 'hidden' }}>
              {/* Workspace Header */}
              <div
                onClick={() => toggleWorkspace(ws.id)}
                style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: expandedWs === ws.id ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className={`fas fa-chevron-${expandedWs === ws.id ? 'down' : 'right'}`} style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', width: '12px' }}></i>
                  <i className="fas fa-folder" style={{ color: 'var(--accent-primary)' }}></i>
                  <span style={{ fontWeight: 600 }}>{ws.name}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {new Date(ws.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Projects */}
              {expandedWs === ws.id && (
                <div style={{ padding: '0.5rem 1.25rem 1rem', paddingLeft: '3rem' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Projects</span>
                    <button className="btn btn-glass btn-sm" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => { setShowNewProj(ws.id); setNewName(''); }}>
                      <i className="fas fa-plus me-1"></i> Project
                    </button>
                  </div>

                  {showNewProj === ws.id && (
                    <div className="glass-panel p-2 mb-2 animate-fade-in" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <input className="form-control" style={{ flex: 1, minWidth: '150px' }} placeholder="Project name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                      <input className="form-control" style={{ flex: 1, minWidth: '150px' }} placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                      <button className="btn btn-primary btn-sm" onClick={() => createProject(ws.id)}>Create</button>
                      <button className="btn btn-glass btn-sm" onClick={() => setShowNewProj(null)}>✕</button>
                    </div>
                  )}

                  {(projects[ws.id] || []).length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.5rem 0' }}>No projects yet</p>
                  ) : (
                    (projects[ws.id] || []).map(proj => (
                      <div key={proj.id} style={{ marginBottom: '0.5rem' }}>
                        <div
                          onClick={() => toggleProject(proj.id)}
                          style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className={`fas fa-chevron-${expandedProj === proj.id ? 'down' : 'right'}`} style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', width: '10px' }}></i>
                            <i className="fas fa-project-diagram" style={{ color: '#8b5cf6', fontSize: '0.85rem' }}></i>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{proj.name}</span>
                          </div>
                          <Link
                            to={`/admin/doc/campaign/new?project=${proj.id}&workspace=${ws.id}`}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                            onClick={e => e.stopPropagation()}
                          >
                            <i className="fas fa-plus me-1"></i> Campaign
                          </Link>
                        </div>

                        {/* Campaigns */}
                        {expandedProj === proj.id && (
                          <div style={{ paddingLeft: '2rem', paddingTop: '0.5rem' }}>
                            {(campaigns[proj.id] || []).length === 0 ? (
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0.25rem 0' }}>No campaigns yet</p>
                            ) : (
                              (campaigns[proj.id] || []).map(camp => (
                                <Link
                                  key={camp.id}
                                  to={`/admin/doc/campaign/${camp.id}`}
                                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '0.35rem', textDecoration: 'none', color: 'inherit' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <i className="fas fa-envelope" style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}></i>
                                    <span style={{ fontSize: '0.85rem' }}>{camp.name}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                      {camp.sent_count}/{camp.total_recipients}
                                    </span>
                                    {statusBadge(camp.status)}
                                  </div>
                                </Link>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocEnginePage;
