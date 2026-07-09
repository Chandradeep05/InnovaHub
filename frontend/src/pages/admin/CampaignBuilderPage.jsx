import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STEPS = ['Setup', 'Template', 'Data', 'Email', 'Send'];

const CampaignBuilderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const workspaceId = searchParams.get('workspace');
  const campaignIdParam = searchParams.get('campaign');

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Step 1: Setup
  const [campaignName, setCampaignName] = useState('');
  const [docIdPrefix, setDocIdPrefix] = useState('DOC');
  const [campaignId, setCampaignId] = useState(campaignIdParam || '');

  // Step 2: Template
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateVersion, setTemplateVersion] = useState(1);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [layoutFields, setLayoutFields] = useState([]);
  const canvasRef = useRef(null);
  const [bgImage, setBgImage] = useState(null);
  const [dragging, setDragging] = useState(null);

  // Step 3: Data
  const [csvText, setCsvText] = useState('');
  const [csvResult, setCsvResult] = useState(null);

  // Step 4: Email
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Step 5: Send
  const [previewPdf, setPreviewPdf] = useState(null);
  const [previewRecipient, setPreviewRecipient] = useState(null);
  const [sendStatus, setSendStatus] = useState(null);
  const [validation, setValidation] = useState(null);
  const [sending, setSending] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate('/admin/login'); return; }
    if (workspaceId) fetchTemplates();
    if (campaignIdParam) loadExistingCampaign();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/doc/templates/${workspaceId}`, { headers });
      setTemplates(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadExistingCampaign = async () => {
    try {
      const res = await fetch(`${API_URL}/api/doc/campaigns/${campaignIdParam}`, { headers });
      const data = await res.json();
      setCampaignName(data.name);
      setDocIdPrefix(data.doc_id_prefix || 'DOC');
      setSelectedTemplate(data.template_id || '');
      setTemplateVersion(data.template_version || 1);
      setEmailSubject(data.email_subject || '');
      setEmailBody(data.email_body || '');
      setCampaignId(campaignIdParam);
    } catch (e) { console.error(e); }
  };

  // Step 1: Create Campaign
  const createCampaign = async () => {
    if (!campaignName.trim()) { setError('Campaign name required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/doc/campaigns`, {
        method: 'POST', headers,
        body: JSON.stringify({ project_id: projectId, name: campaignName, doc_id_prefix: docIdPrefix }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaignId(data.id);
      setStep(1);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Step 2: Template
  const createTemplate = async () => {
    if (!newTemplateName.trim()) return;
    const res = await fetch(`${API_URL}/api/doc/templates`, {
      method: 'POST', headers,
      body: JSON.stringify({ workspace_id: workspaceId, name: newTemplateName }),
    });
    const data = await res.json();
    setTemplates(prev => [...prev, data]);
    setSelectedTemplate(data.id);
    setShowNewTemplate(false);
    setNewTemplateName('');
  };

  const saveTemplateVersion = async () => {
    if (!bgImageUrl || layoutFields.length === 0) {
      setError('Upload a background image and add at least one field');
      return;
    }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/doc/templates/${selectedTemplate}/version`, {
        method: 'PUT', headers,
        body: JSON.stringify({ layout_json: layoutFields, base_image_url: bgImageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTemplateVersion(data.version);
      // Update campaign with template
      await fetch(`${API_URL}/api/doc/campaigns/${campaignId}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ template_id: selectedTemplate, template_version: data.version }),
      }).catch(() => {});
      setSuccess('Template saved!');
      setTimeout(() => { setSuccess(''); setStep(2); }, 1000);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const addField = () => {
    setLayoutFields(prev => [...prev, {
      key: `field_${prev.length + 1}`,
      x: 420, y: 300,
      fontSize: 28,
      fontFamily: 'Helvetica-Bold',
      color: '#1a1a1a',
      alignment: 'center',
      maxWidth: 500,
    }]);
  };

  const updateField = (idx, updates) => {
    setLayoutFields(prev => prev.map((f, i) => i === idx ? { ...f, ...updates } : f));
  };

  const removeField = (idx) => {
    setLayoutFields(prev => prev.filter((_, i) => i !== idx));
  };

  // Load background image for canvas preview
  useEffect(() => {
    if (!bgImageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setBgImage(img);
    img.src = bgImageUrl;
  }, [bgImageUrl]);

  // Draw canvas preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bgImage) return;
    const ctx = canvas.getContext('2d');
    const scale = canvas.width / 842;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    layoutFields.forEach((field, i) => {
      const x = field.x * scale;
      const y = field.y * scale;
      const fontSize = field.fontSize * scale;
      ctx.font = `${field.fontFamily.includes('Bold') ? 'bold ' : ''}${fontSize}px sans-serif`;
      ctx.fillStyle = field.color || '#1a1a1a';
      ctx.textAlign = field.alignment || 'center';
      ctx.fillText(`{{${field.key}}}`, x, y);
      // Draw selection box
      ctx.strokeStyle = i === dragging ? '#14b8a6' : 'rgba(20,184,166,0.3)';
      ctx.lineWidth = 1;
      const tw = ctx.measureText(`{{${field.key}}}`).width;
      const bx = field.alignment === 'center' ? x - tw / 2 : field.alignment === 'right' ? x - tw : x;
      ctx.strokeRect(bx - 4, y - fontSize, tw + 8, fontSize + 8);
    });
  }, [bgImage, layoutFields, dragging]);

  // Step 3: Upload CSV
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target.result);
    reader.readAsText(file);
  };

  const uploadCSV = async () => {
    if (!csvText.trim()) { setError('Please upload or paste CSV data'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/doc/campaigns/${campaignId}/upload-csv`, {
        method: 'POST', headers,
        body: JSON.stringify({ csv: csvText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCsvResult(data);
      setSuccess(`${data.recipientCount} recipients loaded!`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Step 4: Save email settings
  const saveEmail = async () => {
    if (!emailSubject.trim()) { setError('Subject required'); return; }
    setLoading(true); setError('');
    try {
      // We use a direct PATCH-like approach by re-creating
      // For now just proceed — email subject/body sent at send time
      setStep(4);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Step 5: Preview + Send
  const generatePreview = async (idx = 0) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/doc/campaigns/${campaignId}/preview`, {
        method: 'POST', headers,
        body: JSON.stringify({ recipientIndex: idx }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreviewPdf(data.pdf);
      setPreviewRecipient(data.recipient);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const testSend = async () => {
    setLoading(true); setError('');
    try {
      const adminEmail = JSON.parse(localStorage.getItem('adminUser') || '{}').email;
      const res = await fetch(`${API_URL}/api/doc/campaigns/${campaignId}/test-send`, {
        method: 'POST', headers,
        body: JSON.stringify({ recipientIndex: 0, testEmail: adminEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Test email sent! Check your inbox.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const validateCampaign = async () => {
    try {
      const res = await fetch(`${API_URL}/api/doc/campaigns/${campaignId}/validate`, {
        method: 'POST', headers,
        body: JSON.stringify({ email_subject: emailSubject, email_body: emailBody }),
      });
      const data = await res.json();
      setValidation(data);
      return data.valid;
    } catch (e) { setError(e.message); return false; }
  };

  const sendAll = async () => {
    const valid = await validateCampaign();
    if (!valid) return;
    if (!window.confirm('Send to ALL recipients? This cannot be undone.')) return;
    setSending(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/doc/campaigns/${campaignId}/send-all`, {
        method: 'POST', headers,
        body: JSON.stringify({ email_subject: emailSubject, email_body: emailBody }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      // Start polling for status
      pollRef.current = setInterval(async () => {
        const sr = await fetch(`${API_URL}/api/doc/campaigns/${campaignId}/status`, { headers });
        const sd = await sr.json();
        setSendStatus(sd);
        if (sd.status === 'completed' || sd.status === 'failed') {
          clearInterval(pollRef.current);
          setSending(false);
        }
      }, 2000);
    } catch (e) { setError(e.message); setSending(false); }
  };

  const stepContent = () => {
    switch (step) {
      case 0: return (
        <div className="glass-card p-4 animate-fade-in" style={{ maxWidth: '600px' }}>
          <h4 style={{ marginBottom: '1.5rem' }}><i className="fas fa-cog me-2" style={{ color: 'var(--accent-primary)' }}></i>Campaign Setup</h4>
          <div className="form-group mb-3">
            <label>Campaign Name *</label>
            <input className="form-control" placeholder="e.g., Hackathon 2026 Participation Certificates" value={campaignName} onChange={e => setCampaignName(e.target.value)} />
          </div>
          <div className="form-group mb-3">
            <label>Document ID Prefix</label>
            <input className="form-control" placeholder="e.g., XENO, HACK, CERT" value={docIdPrefix} onChange={e => setDocIdPrefix(e.target.value.toUpperCase())} style={{ maxWidth: '200px' }} />
            <small style={{ color: 'var(--text-secondary)' }}>IDs will be: {docIdPrefix}{new Date().getFullYear()}-001, {docIdPrefix}{new Date().getFullYear()}-002, ...</small>
          </div>
          <button className="btn btn-primary" onClick={campaignId ? () => setStep(1) : createCampaign} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-arrow-right me-2"></i>}
            {campaignId ? 'Continue' : 'Create Campaign'}
          </button>
        </div>
      );

      case 1: return (
        <div className="animate-fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4><i className="fas fa-image me-2" style={{ color: 'var(--accent-primary)' }}></i>Template Design</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {templates.length > 0 && (
                <select className="form-control" style={{ width: 'auto', minWidth: '200px' }} value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                  <option value="">Select template...</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
              <button className="btn btn-glass btn-sm" onClick={() => setShowNewTemplate(true)}>
                <i className="fas fa-plus me-1"></i> New
              </button>
            </div>
          </div>

          {showNewTemplate && (
            <div className="glass-panel p-2 mb-3 animate-fade-in" style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px' }}>
              <input className="form-control" placeholder="Template name" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} autoFocus />
              <button className="btn btn-primary btn-sm" onClick={createTemplate}>Create</button>
              <button className="btn btn-glass btn-sm" onClick={() => setShowNewTemplate(false)}>✕</button>
            </div>
          )}

          {selectedTemplate && (
            <div className="glass-card p-4">
              <div className="form-group mb-3">
                <label>Background Image URL</label>
                <input className="form-control" placeholder="https://example.com/certificate-bg.png" value={bgImageUrl} onChange={e => setBgImageUrl(e.target.value)} />
                <small style={{ color: 'var(--text-secondary)' }}>Use Supabase Storage or any public image URL. Recommended: 842×595px (A4 landscape)</small>
              </div>

              {bgImage && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Field Preview</span>
                    <button className="btn btn-glass btn-sm" onClick={addField} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                      <i className="fas fa-plus me-1"></i> Add Field
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={842}
                    height={595}
                    style={{ width: '100%', maxWidth: '842px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'crosshair' }}
                  />
                </div>
              )}

              {/* Field Editor */}
              {layoutFields.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Fields ({layoutFields.length})</span>
                  {layoutFields.map((field, i) => (
                    <div key={i} className="glass-panel p-2 mb-2" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input className="form-control" style={{ width: '110px' }} placeholder="key" value={field.key} onChange={e => updateField(i, { key: e.target.value })} />
                      <input className="form-control" style={{ width: '65px' }} type="number" placeholder="X" value={field.x} onChange={e => updateField(i, { x: +e.target.value })} />
                      <input className="form-control" style={{ width: '65px' }} type="number" placeholder="Y" value={field.y} onChange={e => updateField(i, { y: +e.target.value })} />
                      <input className="form-control" style={{ width: '55px' }} type="number" placeholder="Size" value={field.fontSize} onChange={e => updateField(i, { fontSize: +e.target.value })} />
                      <select className="form-control" style={{ width: '130px' }} value={field.fontFamily} onChange={e => updateField(i, { fontFamily: e.target.value })}>
                        <option>Helvetica</option>
                        <option>Helvetica-Bold</option>
                        <option>Times-Roman</option>
                        <option>Times-Bold</option>
                        <option>Courier</option>
                        <option>Courier-Bold</option>
                      </select>
                      <input type="color" value={field.color} onChange={e => updateField(i, { color: e.target.value })} style={{ width: '35px', height: '32px', padding: '2px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
                      <select className="form-control" style={{ width: '85px' }} value={field.alignment} onChange={e => updateField(i, { alignment: e.target.value })}>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                      <button className="btn btn-glass btn-sm" onClick={() => removeField(i)} style={{ padding: '0.2rem 0.5rem', color: 'var(--danger)' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <button className="btn btn-primary" onClick={saveTemplateVersion} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-save me-2"></i>}
                Save Template & Continue
              </button>
            </div>
          )}
        </div>
      );

      case 2: return (
        <div className="glass-card p-4 animate-fade-in" style={{ maxWidth: '800px' }}>
          <h4 style={{ marginBottom: '1.5rem' }}><i className="fas fa-file-csv me-2" style={{ color: 'var(--accent-primary)' }}></i>Upload Recipient Data</h4>
          <div className="form-group mb-3">
            <label>Upload CSV File</label>
            <input type="file" className="form-control" accept=".csv" onChange={handleFileUpload} />
          </div>
          <div className="form-group mb-3">
            <label>Or Paste CSV</label>
            <textarea className="form-control" rows="6" placeholder={"name,email,event,branch\nRahul Sharma,rahul@gmail.com,Hackathon 2026,CSE\nPriya Singh,priya@gmail.com,Hackathon 2026,IT"} value={csvText} onChange={e => setCsvText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
          </div>
          <button className="btn btn-primary mb-3" onClick={uploadCSV} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-upload me-2"></i>}
            Parse & Load Recipients
          </button>

          {csvResult && (
            <div className="glass-panel p-3 animate-fade-in">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontWeight: 600 }}>✅ {csvResult.recipientCount} recipients loaded</span>
                <span className="badge badge-info">{csvResult.normalizedHeaders?.length} fields detected</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {(csvResult.normalizedHeaders || []).map(h => (
                  <span key={h} style={{ background: 'rgba(20,184,166,0.15)', color: 'var(--accent-hover)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                    {`{{${h}}}`}
                  </span>
                ))}
              </div>
              {csvResult.preview && (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>{(csvResult.normalizedHeaders || []).map(h => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {csvResult.preview.map((row, i) => (
                        <tr key={i}>{(csvResult.normalizedHeaders || []).map(h => <td key={h}>{row.merge_fields?.[h] || row[h] || ''}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button className="btn btn-primary mt-2" onClick={() => setStep(3)}>
                <i className="fas fa-arrow-right me-2"></i> Continue to Email
              </button>
            </div>
          )}
        </div>
      );

      case 3: return (
        <div className="glass-card p-4 animate-fade-in" style={{ maxWidth: '700px' }}>
          <h4 style={{ marginBottom: '1.5rem' }}><i className="fas fa-envelope me-2" style={{ color: 'var(--accent-primary)' }}></i>Compose Email</h4>
          <div className="form-group mb-3">
            <label>Subject *</label>
            <input className="form-control" placeholder='e.g., Your {{event}} Certificate' value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
            <small style={{ color: 'var(--text-secondary)' }}>Use {'{{placeholders}}'} from your CSV columns</small>
          </div>
          <div className="form-group mb-3">
            <label>Email Body</label>
            <textarea className="form-control" rows="8" placeholder={"Dear {{name}},\n\nPlease find attached your certificate for {{event}}.\n\nCertificate ID: {{document_id}}\n\nBest Regards,\nInnovahub(IH) Team"} value={emailBody} onChange={e => setEmailBody(e.target.value)} />
          </div>
          {csvResult?.normalizedHeaders && (
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Available placeholders: </span>
              {csvResult.normalizedHeaders.map(h => (
                <span key={h} onClick={() => setEmailBody(prev => prev + `{{${h}}}`)} style={{ background: 'rgba(20,184,166,0.15)', color: 'var(--accent-hover)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', cursor: 'pointer', marginRight: '0.3rem' }}>
                  {`{{${h}}}`}
                </span>
              ))}
            </div>
          )}
          <button className="btn btn-primary" onClick={saveEmail} disabled={!emailSubject.trim()}>
            <i className="fas fa-arrow-right me-2"></i> Continue to Send
          </button>
        </div>
      );

      case 4: return (
        <div className="animate-fade-in">
          <h4 style={{ marginBottom: '1.5rem' }}><i className="fas fa-paper-plane me-2" style={{ color: 'var(--accent-primary)' }}></i>Test & Send</h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Test Mode */}
            <div className="glass-card p-3">
              <h5 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}><i className="fas fa-vial me-2"></i>Test Mode</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Preview a certificate and send a test email to yourself</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-glass btn-sm" onClick={() => generatePreview(0)} disabled={loading}>
                  <i className="fas fa-eye me-1"></i> Preview
                </button>
                <button className="btn btn-primary btn-sm" onClick={testSend} disabled={loading}>
                  <i className="fas fa-paper-plane me-1"></i> Test Send
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="glass-card p-3">
              <h5 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}><i className="fas fa-chart-bar me-2"></i>Campaign Stats</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-number" style={{ fontSize: '1.5rem' }}>{csvResult?.recipientCount || 0}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Recipients</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-number" style={{ fontSize: '1.5rem' }}>{sendStatus?.sent_count || 0}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Sent</div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {previewPdf && (
            <div className="glass-card p-3 mb-3 animate-fade-in">
              <h5 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>PDF Preview — {previewRecipient?.name || 'Recipient'}</h5>
              <iframe
                src={`data:application/pdf;base64,${previewPdf}`}
                style={{ width: '100%', height: '500px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                title="PDF Preview"
              />
            </div>
          )}

          {/* Validation */}
          {validation && !validation.valid && (
            <div className="alert alert-error mb-3 animate-fade-in">
              <strong>Validation failed:</strong>
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>
                {validation.errors?.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* Send Status / Progress */}
          {sendStatus && (
            <div className="glass-card p-3 mb-3 animate-fade-in">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontWeight: 600 }}>
                  {sendStatus.status === 'sending' && <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>}
                  {sendStatus.status === 'completed' && '✅ Campaign Complete'}
                  {sendStatus.status === 'failed' && '❌ Campaign Failed'}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {sendStatus.sent_count}/{sendStatus.total_recipients} sent
                  {sendStatus.failed_count > 0 && ` · ${sendStatus.failed_count} failed`}
                </span>
              </div>
              {/* Progress Bar */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                <div style={{
                  width: `${sendStatus.total_recipients ? (sendStatus.sent_count / sendStatus.total_recipients * 100) : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-primary), #06b6d4)',
                  borderRadius: '6px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}

          {/* Send All Button */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={sendAll} disabled={sending || sendStatus?.status === 'completed'} style={{ flex: 1 }}>
              {sending ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</> : <><i className="fas fa-paper-plane me-2"></i>Send All</>}
            </button>
            {sendStatus?.failed_count > 0 && (
              <button className="btn btn-glass" onClick={() => {
                fetch(`${API_URL}/api/doc/campaigns/${campaignId}/retry-failed`, { method: 'POST', headers });
                setSending(true);
              }}>
                <i className="fas fa-redo me-1"></i> Retry Failed
              </button>
            )}
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="admin-page container section min-h-screen" style={{ paddingTop: '6rem' }}>
      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', maxWidth: '600px' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: '4px',
              borderRadius: '2px',
              background: i <= step ? 'linear-gradient(90deg, var(--accent-primary), #06b6d4)' : 'rgba(255,255,255,0.08)',
              transition: 'background 0.3s ease',
              marginBottom: '0.4rem',
            }} />
            <span style={{
              fontSize: '0.72rem',
              fontWeight: i === step ? 600 : 400,
              color: i <= step ? 'var(--accent-hover)' : 'var(--text-secondary)',
            }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-error mb-3 animate-fade-in">{error} <button style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => setError('')}>✕</button></div>}
      {success && <div className="alert alert-success mb-3 animate-fade-in">{success}</div>}

      {stepContent()}
    </div>
  );
};

export default CampaignBuilderPage;
