import React, { useState, useEffect } from 'react';
import './GalleryPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GalleryPage = () => {
  const [mediaType, setMediaType] = useState('photos'); // photos, videos
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom video data (assuming API might not have it yet)
  const [videos] = useState([
    { id: 1, title: 'Hackathon 2025 Highlights', event_name: 'Annual Hackathon', duration: '3:45', thumbnail: 'https://via.placeholder.com/600x400?text=Video+Thumbnail', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 2, title: 'Innovahub(IH) Setup & Journey', event_name: 'Orientation', duration: '12:20', thumbnail: 'https://via.placeholder.com/600x400?text=Orientation', url: 'https://player.vimeo.com/video/76979871' },
  ]);

  // Filters State
  const [yearFilter, setYearFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Lightbox & Video Modal State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchPhotos();
    
    // Keydown for lightbox
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/photos`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      } else {
        // Fallback dummy data if API fails or is empty
        setPhotos([
          { id: 101, title: 'Team building', event_name: 'Hackathon 2025', category: 'Events', year: 2025, image_url: 'https://via.placeholder.com/800x600?text=Team+Photo' },
          { id: 102, title: 'Prize Distribution', event_name: 'Hackathon 2025', category: 'Events', year: 2025, image_url: 'https://via.placeholder.com/600x800?text=Prize+Distribution' },
          { id: 103, title: 'Inauguration', event_name: 'Innovahub(IH) Launch', category: 'Events', year: 2024, image_url: 'https://via.placeholder.com/800x500?text=Inauguration' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredPhotos = photos.filter(photo => {
    const matchYear = yearFilter ? photo.year?.toString() === yearFilter : true;
    const matchEvent = eventFilter ? photo.event_name === eventFilter : true;
    const matchCategory = categoryFilter ? photo.category === categoryFilter : true;
    const matchSearch = searchQuery 
      ? (photo.title?.toLowerCase().includes(searchQuery.toLowerCase()) || photo.event_name?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchYear && matchEvent && matchCategory && matchSearch;
  });

  // Extract unique events for dropdown
  const eventOptions = [...new Set(photos.map(p => p.event_name).filter(Boolean))];

  const resetFilters = () => {
    setYearFilter('');
    setEventFilter('');
    setCategoryFilter('');
    setSearchQuery('');
  };

  // Lightbox handlers
  const openLightbox = (index) => {
    setCurrentMediaIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => setCurrentMediaIndex((prev) => (prev + 1) % filteredPhotos.length);
  const handlePrev = () => setCurrentMediaIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);

  const openVideo = (video) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  return (
    <div className="gallery-page page-container animate-fade-in section min-h-screen">
      <div className="container" style={{ maxWidth: '1400px' }}>
        <div className="section-header text-center">
          <h2>Media Gallery</h2>
          <p className="text-secondary">Explore memories from our past events and activities.</p>
        </div>

        <div className="d-flex justify-content-center mb-5">
          <div className="btn-group shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <button 
              className={`btn ${mediaType === 'photos' ? 'btn-primary' : 'btn-light border'} px-4 py-2`} 
              onClick={() => setMediaType('photos')}
            >
              <i className="fas fa-camera retro-icon me-2"></i> Photos
            </button>
            <button 
              className={`btn ${mediaType === 'videos' ? 'btn-primary' : 'btn-light border'} px-4 py-2`} 
              onClick={() => setMediaType('videos')}
            >
              <i className="fas fa-video retro-icon me-2"></i> Videos
            </button>
          </div>
        </div>

        <div className="row">
          {/* Sidebar / Filters (only for photos based on PRD) */}
          {mediaType === 'photos' && (
            <div className="col-lg-3 mb-4">
              <div className="glass-card p-4 sticky-top" style={{ top: '100px' }}>
                <h4 className="mb-3">Filters</h4>
                
                <div className="form-group mb-3">
                  <div className="position-relative">
                    <i className="fas fa-search position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
                    <input type="text" className="form-control rounded-pill ps-5" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="small fw-bold text-secondary text-uppercase mb-2">Year</label>
                  <select className="form-select" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                    <option value="">All Years</option>
                    {[2026, 2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label className="small fw-bold text-secondary text-uppercase mb-2">Category</label>
                  <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    <option value="Events">Events</option>
                    <option value="Achievements">Achievements</option>
                    <option value="Members">Members</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group mb-4">
                  <label className="small fw-bold text-secondary text-uppercase mb-2">Event</label>
                  <select className="form-select" value={eventFilter} onChange={e => setEventFilter(e.target.value)}>
                    <option value="">All Events</option>
                    {eventOptions.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                  </select>
                </div>

                <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>
                  <i className="fas fa-undo me-2"></i> Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className={mediaType === 'photos' ? 'col-lg-9' : 'col-12'}>
            
            {loading && mediaType === 'photos' ? (
              <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-3">Loading gallery...</p></div>
            ) : mediaType === 'photos' ? (
              <>
                <p className="text-secondary mb-4">Showing {filteredPhotos.length} photos</p>
                {filteredPhotos.length === 0 ? (
                  <div className="glass-card text-center p-5">
                    <p className="text-secondary m-0">No photos match your filter criteria.</p>
                  </div>
                ) : (
                  <div className="gallery-masonry">
                    {filteredPhotos.map((photo, index) => (
                      <div key={photo.id} className="gallery-item-wrapper mb-4" onClick={() => openLightbox(index)}>
                        <div className="gallery-item cursor-pointer position-relative rounded shadow-sm overflow-hidden bg-light" style={{ minHeight: '150px' }}>
                          <img src={photo.image_url} alt={photo.title || 'Gallery image'} loading="lazy" className="w-100 h-auto" style={{ transition: 'transform 0.4s' }} />
                          <div className="gallery-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-3 text-white" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', opacity: 0, transition: 'opacity 0.3s' }}>
                            <h5 className="m-0">{photo.title}</h5>
                            <p className="small text-light m-0 opacity-75">{photo.event_name} {photo.year && `• ${photo.year}`}</p>
                            <button className="btn btn-sm btn-light position-absolute top-0 end-0 m-3 rounded-circle" style={{ width: '32px', height: '32px', padding: 0 }} onClick={(e) => { e.stopPropagation(); alert('Downloading image...'); }}>
                              <i className="fas fa-download text-dark"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Videos Section
              <div className="row g-4">
                {videos.map(video => (
                  <div key={video.id} className="col-md-6 col-lg-4">
                    <div className="video-card glass-card cursor-pointer overflow-hidden position-relative" onClick={() => openVideo(video)}>
                      <div className="position-relative">
                        <img src={video.thumbnail} alt={video.title} className="w-100" style={{ height: '220px', objectFit: 'cover' }} />
                        <div className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center bg-white bg-opacity-75 rounded-circle shadow" style={{ width: '60px', height: '60px', transition: 'transform 0.2s' }}>
                          <i className="fas fa-play fs-4 text-primary ms-1"></i>
                        </div>
                        <span className="position-absolute bottom-0 end-0 bg-dark text-white small px-2 py-1 m-2 rounded">{video.duration}</span>
                      </div>
                      <div className="p-3">
                        <h5 className="mb-1 text-truncate">{video.title}</h5>
                        <p className="text-secondary small mb-0">{video.event_name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && filteredPhotos[currentMediaIndex] && (
        <div className="lightbox-overlay position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1050 }}>
          <div className="lightbox-header position-absolute top-0 w-100 p-3 d-flex justify-content-between align-items-center text-white">
            <span className="fs-5">{currentMediaIndex + 1} / {filteredPhotos.length}</span>
            <div className="d-flex gap-3">
              <button className="btn btn-link text-white text-decoration-none" onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!'); }}>
                <i className="fas fa-share-alt fs-4"></i>
              </button>
              <button className="btn btn-link text-white text-decoration-none" onClick={() => alert('Downloading...')}>
                <i className="fas fa-download fs-4"></i>
              </button>
              <button className="btn btn-link text-white text-decoration-none ms-2" onClick={() => setLightboxOpen(false)}>
                <i className="fas fa-times fs-3"></i>
              </button>
            </div>
          </div>
          
          <button className="btn btn-link text-white position-absolute start-0 top-50 translate-middle-y px-4" onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
            <i className="fas fa-chevron-left fs-1 opacity-75 hover-opacity-100"></i>
          </button>

          <img 
            src={filteredPhotos[currentMediaIndex].image_url} 
            alt={filteredPhotos[currentMediaIndex].title || 'Gallery Full View'} 
            className="lightbox-image" 
            style={{ maxHeight: '80vh', maxWidth: '90vw', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="lightbox-caption text-center text-white mt-3" style={{ maxWidth: '800px' }}>
            <h4 className="m-0 mb-1">{filteredPhotos[currentMediaIndex].title}</h4>
            <p className="text-white-50 m-0">{filteredPhotos[currentMediaIndex].event_name} • {filteredPhotos[currentMediaIndex].category}</p>
          </div>

          <button className="btn btn-link text-white position-absolute end-0 top-50 translate-middle-y px-4" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
            <i className="fas fa-chevron-right fs-1 opacity-75 hover-opacity-100"></i>
          </button>
        </div>
      )}

      {/* Video Modal */}
      {videoModalOpen && selectedVideo && (
        <div className="video-modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1050 }} onClick={() => setVideoModalOpen(false)}>
          <div className="position-relative w-100" style={{ maxWidth: '900px', margin: '1rem' }} onClick={e => e.stopPropagation()}>
            <button className="btn btn-link text-white position-absolute top-0 end-0 translate-middle" style={{ zIndex: 10, marginTop: '-30px', marginRight: '-30px' }} onClick={() => setVideoModalOpen(false)}>
              <i className="fas fa-times fs-2"></i>
            </button>
            <div className="ratio ratio-16x9 bg-black rounded shadow-lg overflow-hidden">
              <iframe 
                src={selectedVideo.url} 
                title={selectedVideo.title} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <div className="text-white mt-3 px-2">
              <h4 className="mb-1">{selectedVideo.title}</h4>
              <p className="text-white-50 mb-0">{selectedVideo.event_name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
