import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminGalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', event_name: '', category: '', year: new Date().getFullYear(), image_url: '', thumbnail_url: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchPhotos();
  }, [navigate]);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/photos`);
      if (!res.ok) throw new Error('Failed to fetch');
      setPhotos(await res.json());
    } catch (err) { 
      setPhotos([
        { id: 1, title: 'Hackathon Winners 2024', category: 'event', event_name: 'HackAI 24', year: 2024, image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
        { id: 2, title: 'Ideation Workshop Pitch', category: 'workshop', event_name: 'StartUp 101', year: 2024, image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
        { id: 3, title: 'Lab Inauguration', category: 'ceremony', event_name: 'IIC Hub Launch', year: 2023, image_url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
      ]);
      setError('Simulating data: Backend unreachable'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to add photo');
      setShowForm(false);
      setFormData({ title: '', event_name: '', category: '', year: new Date().getFullYear(), image_url: '', thumbnail_url: '' });
      fetchPhotos();
    } catch (err) { 
      const newPhoto = { id: Date.now(), ...formData, image_url: formData.image_url || 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?ixlib=rb-4.0.3&w=500&q=60' };
      setPhotos([newPhoto, ...photos]);
      setShowForm(false);
      setFormData({ title: '', event_name: '', category: '', year: new Date().getFullYear(), image_url: '', thumbnail_url: '' });
    }
  };

  const handleDelete = (id) => {
    if(window.confirm('Delete this photo from gallery?')) {
        setPhotos(photos.filter(p => p.id !== id));
    }
  }

  return (
    <div className="admin-page section bg-light min-h-screen py-5 px-3 px-lg-5" style={{ minHeight: '100vh' }}>
      <div className="container-fluid" style={{ maxWidth: '1400px' }}>
        
        {/* Header Area */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 bg-white p-4 rounded-4 shadow-sm border-0">
          <div>
            <h2 className="mb-1 fw-bold"><i className="fas fa-images text-danger me-2"></i> Media Gallery Manager</h2>
            <p className="text-secondary small mb-0">Upload new event photos or manage existing albums in the public gallery.</p>
          </div>
          <div className="mt-3 mt-md-0 d-flex gap-2">
            <button className={`btn ${showForm ? 'btn-secondary' : 'btn-danger'} rounded-pill px-4 shadow-sm`} onClick={() => setShowForm(!showForm)}>
              <i className={`fas fa-${showForm ? 'times' : 'upload'} me-2`}></i> {showForm ? 'Cancel Upload' : 'Upload Photo'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-warning border-0 shadow-sm rounded-4 mb-4"><i className="fas fa-exclamation-triangle me-2"></i> {error}</div>}

        {/* Upload Form */}
        {showForm && (
          <div className="glass-card p-4 p-md-5 mb-5 rounded-4 shadow-lg border-danger border-top border-5 animate-fade-in bg-white">
            <h4 className="fw-bold mb-4">Add Media to Gallery</h4>
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold mb-1">Photo Title</label>
                  <input type="text" className="form-control bg-light border-0" placeholder="e.g. Closing Ceremony Speech" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} required/>
                </div>
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold mb-1">Associated Event</label>
                  <input type="text" className="form-control bg-light border-0" placeholder="e.g. Hackathon 2024" value={formData.event_name} onChange={e=>setFormData({...formData, event_name: e.target.value})}/>
                </div>
              </div>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="small text-secondary fw-bold mb-1">Category</label>
                  <select className="form-select bg-light border-0" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} required>
                     <option value="">Select...</option>
                     <option value="event">Event</option>
                     <option value="workshop">Workshop</option>
                     <option value="ceremony">Ceremony</option>
                     <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="small text-secondary fw-bold mb-1">Year</label>
                  <input type="number" className="form-control bg-light border-0" value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})} required/>
                </div>
                <div className="col-md-4">
                  <label className="small text-secondary fw-bold mb-1">Image URL</label>
                  <input type="url" className="form-control bg-light border-0" placeholder="https://..." value={formData.image_url} onChange={e=>setFormData({...formData, image_url: e.target.value})} required/>
                </div>
              </div>
              <button type="submit" className="btn btn-danger px-5 rounded-pill shadow-sm"><i className="fas fa-cloud-upload-alt me-2"></i> Confirm Upload</button>
            </form>
          </div>
        )}

        {/* Photo Grid */}
        {loading ? (
             <div className="text-center py-5"><div className="spinner-border text-danger fs-3"></div></div>
        ) : photos.length === 0 ? (
            <div className="text-center bg-white p-5 rounded-4 shadow-sm">No photos found. Upload one above!</div>
        ) : (
            <div className="row g-4">
              {photos.map(p => (
                <div key={p.id} className="col-sm-6 col-md-4 col-xl-3">
                  <div className="card h-100 border-0 rounded-4 shadow-sm overflow-hidden hover-lift group" style={{ transition: 'all 0.3s' }}>
                    <div className="position-relative" style={{ height: '200px' }}>
                      <img src={p.image_url} alt={p.title} className="w-100 h-100 object-fit-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?ixlib=rb-4.0.3&w=500&q=60' }}/>
                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-0 hover-opacity-50 transition-all d-flex align-items-center justify-content-center p-3 opacity-hover">
                         <button className="btn btn-light rounded-circle text-danger shadow d-none btn-hover-show scale-in" style={{ width: '45px', height: '45px' }} onClick={() => handleDelete(p.id)} title="Delete Photo">
                           <i className="fas fa-trash-alt"></i>
                         </button>
                      </div>
                      <span className="position-absolute top-0 end-0 bg-white text-dark small fw-bold px-2 py-1 rounded-bl-3 shadow-sm m-2" style={{ borderRadius: '0.5rem' }}>{p.year}</span>
                    </div>
                    <div className="card-body p-3">
                      <h6 className="fw-bold mb-1 text-truncate" title={p.title}>{p.title}</h6>
                      <p className="small text-secondary mb-0"><i className="fas fa-tag me-1 opacity-50"></i> {p.category.toUpperCase()}</p>
                      {p.event_name && <p className="small text-muted mb-0 text-truncate"><i className="fas fa-calendar me-1 opacity-50"></i> {p.event_name}</p>}
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

export default AdminGalleryPage;
