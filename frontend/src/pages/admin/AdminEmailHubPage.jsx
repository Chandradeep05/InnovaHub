import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminEmailHubPage = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  
  const [formData, setFormData] = useState({
    recipientType: 'ALL_REGISTRANTS',
    customEmails: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    if (!token || !userStr) {
      navigate('/admin/login');
      return;
    }
    setAdmin(JSON.parse(userStr));
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limit to 5MB
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'Attachment must be under 5MB.' });
        e.target.value = '';
        return;
      }
      setAttachmentFile(file);
    } else {
      setAttachmentFile(null);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:xxx;base64, prefix — Brevo expects raw base64
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = { ...formData };

      // Convert attachment to base64 if present
      if (attachmentFile) {
        const base64Content = await fileToBase64(attachmentFile);
        payload.attachment = {
          content: base64Content,
          name: attachmentFile.name,
        };
      }

      const response = await fetch(`${API_URL}/api/admin/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: data.message || 'Emails queued for sending successfully!' });
        setFormData({ ...formData, subject: '', message: '', customEmails: '' });
        setAttachmentFile(null);
        // Reset file input
        const fileInput = document.getElementById('email-attachment-input');
        if (fileInput) fileInput.value = '';
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send emails.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error communicating with the mail server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page container section min-h-screen">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Email Communications Hub</h2>
      </div>
      
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="glass-card p-4">
            <h4 className="mb-4 text-primary"><i className="fas fa-paper-plane me-2"></i> Compose Email Campaign</h4>
            
            {status.message && (
              <div className={`alert alert-${status.type}`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label className="fw-500 mb-2">To: Recipient Group *</label>
                <select 
                  className="form-control" 
                  name="recipientType" 
                  value={formData.recipientType} 
                  onChange={handleChange}
                  required
                >
                  <option value="ALL_REGISTRANTS">All Event Registrants</option>
                  <option value="ALL_MEMBERS">All Active Innovahub(IH) Members</option>
                  <option value="ALL_IDEAS">All Idea Submitters</option>
                  <option value="CUSTOM">Custom Email Addresses (Comma separated)</option>
                </select>
              </div>

              {formData.recipientType === 'CUSTOM' && (
                <div className="form-group mb-3 animate-fade-in">
                  <label className="fw-500 mb-2">Custom Email Addresses *</label>
                  <textarea 
                    name="customEmails" 
                    value={formData.customEmails} 
                    onChange={handleChange} 
                    className="form-control" 
                    rows="2" 
                    placeholder="student1@college.edu, faculty2@college.edu"
                    required
                  ></textarea>
                </div>
              )}

              <div className="form-group mb-3">
                <label className="fw-500 mb-2">Subject *</label>
                <input 
                  type="text" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleChange} 
                  className="form-control" 
                  placeholder="e.g., Invitation to Innovahub(IH) Hackathon 2026"
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label className="fw-500 mb-2">Message Body *</label>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange} 
                  className="form-control text-monospace" 
                  rows="10" 
                  placeholder={"Dear Participant,\n\nWe are excited to invite you...\n\nBest Regards,\nInnovahub(IH) Team"}
                  required
                ></textarea>
                <small className="text-secondary mt-2 d-block">
                  <i className="fas fa-info-circle me-1"></i> HTML is not supported in this basic editor. The email will be sent as plain text or formatted standard text.
                </small>
              </div>

              <div className="form-group mb-4">
                <label className="fw-500 mb-2">
                  <i className="fas fa-paperclip me-1"></i> Attachment (Optional)
                </label>
                <input
                  id="email-attachment-input"
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                />
                <small className="text-secondary mt-2 d-block">
                  <i className="fas fa-info-circle me-1"></i> Max 5MB. Supported: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP
                </small>
                {attachmentFile && (
                  <div className="mt-2 d-flex align-items-center" style={{ gap: '8px' }}>
                    <span className="badge" style={{ background: 'var(--primary)', color: '#fff', padding: '6px 12px', borderRadius: '8px' }}>
                      <i className="fas fa-file me-1"></i>
                      {attachmentFile.name} ({(attachmentFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <button 
                      type="button" 
                      className="btn btn-sm" 
                      style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={() => {
                        setAttachmentFile(null);
                        document.getElementById('email-attachment-input').value = '';
                      }}
                    >
                      <i className="fas fa-times"></i> Remove
                    </button>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending Emails...</>
                ) : (
                  <><i className="fas fa-paper-plane me-2"></i> Send Campaign</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailHubPage;
