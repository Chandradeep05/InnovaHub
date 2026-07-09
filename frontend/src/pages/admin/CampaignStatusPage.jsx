import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CampaignStatusPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const pollRef = useRef(null);
  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { navigate('/admin/login'); return; }
    fetchCampaign();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`${API_URL}/api/doc/campaigns/${id}`, { headers });
      const data = await res.json();
      setCampaign(data);
      if (data.recipients) setRecipients(data.recipients);

      // Auto-poll if sending
      if (data.status === 'sending' && !pollRef.current) {
        pollRef.current = setInterval(async () => {
          const sr = await fetch(`${API_URL}/api/doc/campaigns/${id}/status`, { headers });
          const sd = await sr.json();
          setCampaign(prev => ({ ...prev, ...sd }));
          if (sd.status === 'completed' || sd.status === 'failed') {
            clearInterval(pollRef.current);
            pollRef.current = null;
            fetchCampaign(); // refresh recipients
          }
        }, 3000);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const retryFailed = async () => {
    setRetrying(true);
    try {
      await fetch(`${API_URL}/api/doc/campaigns/${id}/retry-failed`, { method: 'POST', headers });
      // Start polling
      if (!pollRef.current) {
        pollRef.current = setInterval(async () => {
          const sr = await fetch(`${API_URL}/api/doc/campaigns/${id}/status`, { headers });
          const sd = await sr.json();
          setCampaign(prev => ({ ...prev, ...sd }));
          if (sd.status === 'completed' || sd.status === 'failed') {
            clearInterval(pollRef.current);
            pollRef.current = null;
            fetchCampaign();
          }
        }, 3000);
      }
    } catch (e) { console.error(e); }
    finally { setRetrying(false); }
  };

  const downloadZip = async () => {
    setDownloadingZip(true);
    try {
      const res = await fetch(`${API_URL}/api/doc/campaigns/${id}/download-zip`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('ZIP download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaign?.name || 'campaign'}-documents.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); alert(e.message); }
    finally { setDownloadingZip(false); }
  };

  if (loading) return (
    <div className="admin-page container section min-h-screen" style={{ paddingTop: '6rem' }}>
      <div className="text-center p-5"><span className="spinner-border"></span></div>
    </div>
  );

  if (!campaign) return (
    <div className="admin-page container section min-h-screen" style={{ paddingTop: '6rem' }}>
      <div className="glass-panel text-center p-5"><h4>Campaign not found</h4></div>
    </div>
  );

  const progress = campaign.total_recipients ? Math.round((campaign.sent_count / campaign.total_recipients) * 100) : 0;
  const statusColor = { draft: '#64748b', sending: '#f59e0b', completed: '#10b981', failed: '#ef4444' };

  return (
    <div className="admin-page container section min-h-screen" style={{ paddingTop: '6rem' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/admin/doc" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>
            <i className="fas fa-arrow-left me-1"></i> Document Engine
          </Link>
          <h2 style={{ marginBottom: '0.25rem', marginTop: '0.5rem' }}>{campaign.name}</h2>
          <span className="badge" style={{ background: `${statusColor[campaign.status]}20`, color: statusColor[campaign.status], border: `1px solid ${statusColor[campaign.status]}40` }}>
            {campaign.status === 'sending' && <span className="spinner-border spinner-border-sm me-1" style={{ width: '0.7rem', height: '0.7rem' }}></span>}
            {campaign.status?.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {campaign.status === 'draft' && (
            <Link to={`/admin/doc/campaign/new?campaign=${id}&project=${campaign.project_id}&workspace=${campaign.workspace_id || ''}`} className="btn btn-primary btn-sm">
              <i className="fas fa-edit me-1"></i> Edit
            </Link>
          )}
          {campaign.failed_count > 0 && (
            <button className="btn btn-glass btn-sm" onClick={retryFailed} disabled={retrying}>
              <i className="fas fa-redo me-1"></i> Retry Failed ({campaign.failed_count})
            </button>
          )}
          <button className="btn btn-glass btn-sm" onClick={downloadZip} disabled={downloadingZip}>
            {downloadingZip ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="fas fa-file-archive me-1"></i>}
            Download ZIP
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: campaign.total_recipients, icon: 'fa-users', color: '#8b5cf6' },
          { label: 'Sent', value: campaign.sent_count, icon: 'fa-check-circle', color: '#10b981' },
          { label: 'Failed', value: campaign.failed_count, icon: 'fa-times-circle', color: '#ef4444' },
          { label: 'Pending', value: (campaign.total_recipients || 0) - (campaign.sent_count || 0) - (campaign.failed_count || 0), icon: 'fa-clock', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: '1.2rem', marginBottom: '0.5rem', display: 'block' }}></i>
            <div className="stat-number" style={{ fontSize: '1.8rem' }}>{s.value || 0}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {campaign.status !== 'draft' && (
        <div className="glass-card p-3 mb-4">
          <div className="d-flex justify-content-between mb-1">
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Progress</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{progress}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: campaign.status === 'failed' ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, var(--accent-primary), #06b6d4)',
              borderRadius: '6px',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {/* Recipient Table */}
      {recipients.length > 0 && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h5 style={{ margin: 0, fontSize: '1rem' }}>Recipients ({recipients.length})</h5>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.78rem' }}>Status</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.78rem' }}>Email</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.78rem' }}>Name</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.78rem' }}>Doc ID</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.78rem' }}>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.5rem 1rem' }}>
                      {r.send_status === 'sent' && <span style={{ color: '#10b981' }}>✅</span>}
                      {r.send_status === 'failed' && <span style={{ color: '#ef4444' }} title={r.error_message}>❌</span>}
                      {r.send_status === 'pending' && <span style={{ color: '#f59e0b' }}>⏳</span>}
                    </td>
                    <td style={{ padding: '0.5rem 1rem' }}>{r.email}</td>
                    <td style={{ padding: '0.5rem 1rem' }}>{r.merge_fields?.name || '—'}</td>
                    <td style={{ padding: '0.5rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.document_id || '—'}</td>
                    <td style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>
                      {r.sent_at ? new Date(r.sent_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignStatusPage;
