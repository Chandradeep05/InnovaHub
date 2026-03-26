import React, { useState, useEffect } from 'react';
import './InnovationHubPage.css';

const InnovationHubPage = () => {
  const [activeTab, setActiveTab] = useState('submit'); // submit, projects, resources
  
  // Submit Idea State
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', student_name: '', email: '', phone: ''
  });
  const [pitchDeck, setPitchDeck] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Projects State
  const [projects, setProjects] = useState([]);
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('');
  const [projectsLoading, setProjectsLoading] = useState(true);

  const categories = [
    'Technology & Software', 'Hardware & Electronics', 'Sustainability & Environment',
    'Healthcare & BioTech', 'EdTech', 'Social Innovation', 'Other'
  ];

  // Hardcoded Resources as per PRD
  const resources = [
    { id: 1, name: 'Startup Guide 2026', size: '2.4 MB', desc: 'Comprehensive guide to launching your startup at IIC.', type: 'pdf', url: '#' },
    { id: 2, name: 'Pitch Deck Template', size: '5.1 MB', desc: 'Standard PPTX template for idea submissions.', type: 'pptx', url: '#' },
    { id: 3, name: 'Business Model Canvas', size: '1.2 MB', desc: 'One-page business plan template.', type: 'pdf', url: '#' },
    { id: 4, name: 'Funding Resources List', size: '0.8 MB', desc: 'List of seed funds and angel networks.', type: 'pdf', url: '#' },
  ];

  useEffect(() => {
    if (activeTab === 'projects') {
      fetchProjects();
    }
  }, [activeTab]);

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      // In a real app we'd fetch from /api/ideas?status=Approved
      const res = await fetch('http://localhost:5000/api/ideas');
      if (res.ok) {
        const data = await res.json();
        const approved = data.filter(idea => idea.status === 'Approved');
        setProjects(approved);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      if (e.target.files[0].size > 10 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'File too large. Maximum size is 10MB.' });
        e.target.value = null;
      } else if (e.target.files[0].type !== 'application/pdf') {
        setStatus({ type: 'error', message: 'Only PDF files are allowed for pitch decks.' });
        e.target.value = null;
      } else {
        setPitchDeck(e.target.files[0]);
        setStatus({ type: '', message: '' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // In a real scenario we'd use FormData since we're uploading a file
      // const submitData = new FormData();
      // append fields to submitData...
      // Since backend might not support multipart file upload yet, we'll send JSON
      // and simulate the file upload in the UI.

      const response = await fetch('http://localhost:5000/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, pitch_deck_url: 'dummy_upload_url.pdf' }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: `Idea submitted successfully! Your tracking ID is ${data.idea.tracking_id || 'IDEA2026'}` });
        setFormData({ title: '', description: '', category: '', student_name: '', email: '', phone: '' });
        setPitchDeck(null);
        // reset file input
        const fileInput = document.getElementById('pitchDeckInput');
        if (fileInput) fileInput.value = '';
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to submit idea.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projectCategoryFilter 
    ? projects.filter(p => p.category === projectCategoryFilter) 
    : projects;

  return (
    <div className="innovation-page page-container animate-fade-in section min-h-screen">
      <div className="container">
        <div className="section-header text-center">
          <h2>Innovation Hub</h2>
          <p className="text-secondary">Explore ongoing ventures, access resources, or submit your game-changing idea.</p>
        </div>

        <div className="tabs mb-5 text-center">
          <button className={`btn ${activeTab === 'submit' ? 'btn-primary' : 'btn-outline-primary'} me-2`} onClick={() => setActiveTab('submit')}>Submit Idea</button>
          <button className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-outline-primary'} me-2`} onClick={() => setActiveTab('projects')}>Ongoing Projects</button>
          <button className={`btn ${activeTab === 'resources' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('resources')}>Resources Library</button>
        </div>

        {activeTab === 'submit' && (
          <div className="idea-submission glass-card mx-auto" style={{ maxWidth: '800px', padding: '2.5rem' }}>
            <h3 className="mb-4 text-center">Pitch Your Innovation</h3>
            
            {status.message && (
              <div className={`alert alert-${status.type}`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="fw-500 mb-1">Student Name *</label>
                  <input type="text" name="student_name" value={formData.student_name} onChange={handleChange} required maxLength="100" className="form-control" placeholder="John Doe" />
                </div>
                <div className="col-md-6">
                  <label className="fw-500 mb-1">Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-control" placeholder="john@college.edu.in" />
                </div>
              </div>

              <div className="form-group row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="fw-500 mb-1">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required pattern="[0-9]{10}" className="form-control" placeholder="10-digit number" />
                </div>
                <div className="col-md-6">
                  <label className="fw-500 mb-1">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required className="form-control">
                    <option value="" disabled>Select a Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="fw-500 m-0">Idea Title *</label>
                  <small className="text-secondary">{formData.title.length}/200</small>
                </div>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required maxLength="200" className="form-control" placeholder="A brief, catchy title for your idea" />
              </div>

              <div className="form-group mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="fw-500 m-0">Idea Description *</label>
                  <small className="text-secondary">{formData.description.length}/2000</small>
                </div>
                <textarea name="description" value={formData.description} onChange={handleChange} required maxLength="2000" className="form-control" rows="5" placeholder="Describe the problem you're solving and your proposed solution..."></textarea>
              </div>

              <div className="form-group mb-4 p-3 border rounded" style={{ backgroundColor: 'var(--bg-lighter)' }}>
                <label className="fw-500 mb-2 d-block">Upload Pitch Deck (Optional)</label>
                <div className="d-flex align-items-center gap-3">
                  <div className="btn btn-outline-primary position-relative overflow-hidden">
                    <span><i className="fas fa-file-upload me-2"></i> Choose File</span>
                    <input type="file" id="pitchDeckInput" accept=".pdf" onChange={handleFileChange} className="position-absolute top-0 start-0 opacity-0 w-100 h-100" style={{ cursor: 'pointer' }} />
                  </div>
                  <span className="text-secondary small text-truncate">
                    {pitchDeck ? pitchDeck.name : 'No file selected (PDF only, max 10MB)'}
                  </span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100 mt-2 shadow-sm" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span> Submitting...</> : 'Submit Idea for Review'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="ongoing-projects animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <h3 className="m-0">Approved Projects</h3>
              <select className="form-control w-auto" value={projectCategoryFilter} onChange={e => setProjectCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {projectsLoading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-3">Loading projects...</p></div>
            ) : filteredProjects.length === 0 ? (
              <div className="glass-panel text-center p-5">
                <i className="fas fa-rocket fs-1 text-secondary mb-3"></i>
                <h4>No projects found</h4>
                <p className="text-secondary">Be the first to get your idea approved!</p>
              </div>
            ) : (
              <div className="grid project-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {filteredProjects.map(project => (
                  <div key={project.id} className="project-card glass-card p-4">
                    <span className="badge bg-primary mb-3">{project.category}</span>
                    <h4 className="mb-2">{project.title}</h4>
                    <p className="text-primary small mb-3"><i className="fas fa-users me-1"></i> Team lead: {project.student_name}</p>
                    <p className="text-secondary mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </p>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <span className="badge bg-success-subtle text-success border border-success px-2 py-1"><i className="fas fa-check-circle me-1"></i>In Progress</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="resources-library animate-fade-in">
            <h3 className="mb-4">Startup Resources & Templates</h3>
            <div className="list-group">
              {resources.map(res => (
                <div key={res.id} className="list-group-item glass-card mb-3 p-4 d-flex align-items-center border-0">
                  <div className="resource-icon d-flex justify-content-center align-items-center bg-primary-subtle text-primary rounded-circle" style={{ width: '50px', height: '50px', fontSize: '1.5rem', flexShrink: 0 }}>
                    <i className={`fas fa-file-${res.type === 'pdf' ? 'pdf' : 'powerpoint'}`}></i>
                  </div>
                  <div className="resource-info ms-4 flex-grow-1">
                    <h5 className="mb-1">{res.name}</h5>
                    <p className="text-secondary small mb-0">{res.desc}</p>
                  </div>
                  <div className="resource-meta d-flex flex-column align-items-end ms-3">
                    <span className="text-secondary small mb-2">{res.size}</span>
                    <a href={res.url} className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={(e) => { e.preventDefault(); alert('Downloading file...'); }}>
                      <i className="fas fa-download me-1"></i> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InnovationHubPage;
