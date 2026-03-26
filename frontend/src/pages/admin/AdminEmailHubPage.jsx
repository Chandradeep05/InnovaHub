import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminEmailHubPage = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:5000/api/admin/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: data.message || 'Emails queued for sending successfully!' });
        setFormData({ ...formData, subject: '', message: '', customEmails: '' });
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
                  <option value="ALL_MEMBERS">All Active IIC Members</option>
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
                  placeholder="e.g., Invitation to IIC Hackathon 2026"
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label className="fw-500 mb-2">Message Body *</label>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange} 
                  className="form-control text-monospace" 
                  rows="10" 
                  placeholder="Dear Participant,&#10;&#10;We are excited to invite you...&#10;&#10;Best Regards,&#10;IIC Team"
                  required
                ></textarea>
                <small className="text-secondary mt-2 d-block">
                  <i className="fas fa-info-circle me-1"></i> HTML is not supported in this basic editor. The email will be sent as plain text or formatted standard text.
                </small>
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
