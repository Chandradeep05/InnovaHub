import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const searchData = [
    { title: 'Home', path: '/', category: 'Page', icon: 'fa-home' },
    { title: 'Upcoming Events', path: '/events', category: 'Events', icon: 'fa-calendar' },
    { title: 'Past Events Calendar', path: '/events', category: 'Events', icon: 'fa-calendar-alt' },
    { title: 'Innovation Hub', path: '/innovation-hub', category: 'Page', icon: 'fa-lightbulb' },
    { title: 'Submit an Idea', path: '/innovation-hub', category: 'Innovation Hub', icon: 'fa-paper-plane' },
    { title: 'Ongoing Projects', path: '/innovation-hub', category: 'Innovation Hub', icon: 'fa-project-diagram' },
    { title: 'Resources & Templates', path: '/innovation-hub', category: 'Innovation Hub', icon: 'fa-file-alt' },
    { title: 'Photo & Video Gallery', path: '/gallery', category: 'Page', icon: 'fa-images' },
    { title: 'Annual Reports', path: '/reports', category: 'Reports', icon: 'fa-file-pdf' },
    { title: 'Impact Reports', path: '/reports', category: 'Reports', icon: 'fa-file-pdf' },
    { title: 'Members Council', path: '/members', category: 'Page', icon: 'fa-users' },
    { title: 'Join IIC', path: '/members', category: 'Action', icon: 'fa-handshake' },
    { title: 'Contact Us', path: '/contact', category: 'Page', icon: 'fa-envelope' },
    { title: 'FAQs', path: '/contact', category: 'Help', icon: 'fa-question-circle' },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleOpenSearch = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-global-search', handleOpenSearch);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-global-search', handleOpenSearch);
    };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  const results = query 
    ? searchData.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase()))
    : searchData.slice(0, 5);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) {
        navigate(results[activeIndex].path);
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="global-search-overlay position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start" style={{ zIndex: 1060, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)', paddingTop: '12vh' }} onClick={() => setIsOpen(false)}>
      <div className="global-search-modal rounded-4 shadow-lg overflow-hidden w-100 mx-3" style={{ maxWidth: '620px', background: 'rgba(31, 40, 51, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
        
        <div className="search-input-wrapper position-relative p-3 d-flex align-items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <i className="fas fa-search fs-5 ms-2" style={{ color: 'var(--accent-primary)' }}></i>
          <input 
            ref={inputRef}
            type="text" 
            className="form-control border-0 shadow-none fs-5 py-2 px-3 bg-transparent" 
            placeholder="Search pages, resources, actions..." 
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-hover)' }}
          />
          <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>ESC</kbd>
        </div>

        <div className="search-results overflow-auto" style={{ maxHeight: '55vh', padding: '0.5rem' }}>
          {results.length === 0 ? (
            <div className="text-center p-5" style={{ color: 'var(--text-secondary)' }}>
              <i className="fas fa-search fs-1 mb-3 opacity-50"></i>
              <p>No results for "<strong style={{ color: 'var(--accent-hover)' }}>{query}</strong>"</p>
            </div>
          ) : (
            <div>
              <div className="px-3 py-2 small fw-bold text-uppercase" style={{ color: 'var(--text-secondary)', letterSpacing: '1px', fontSize: '0.7rem' }}>
                {query ? `Results (${results.length})` : 'Quick Jump'}
              </div>
              
              {results.map((item, index) => (
                <button
                  key={index}
                  className="d-flex align-items-center w-100 border-0 rounded-3 mb-1 p-3"
                  style={{ 
                    background: activeIndex === index ? 'rgba(69, 162, 158, 0.15)' : 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: activeIndex === index ? '1px solid rgba(102, 252, 241, 0.2)' : '1px solid transparent'
                  }}
                  onClick={() => { navigate(item.path); setIsOpen(false); }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ 
                    width: '40px', height: '40px', flexShrink: 0,
                    background: activeIndex === index ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                    color: activeIndex === index ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}>
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <div className="text-start">
                    <h6 className="mb-0 fw-bold" style={{ color: activeIndex === index ? 'var(--accent-hover)' : 'var(--text-primary)' }}>{item.title}</h6>
                    <small style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>{item.category}</small>
                  </div>
                  {activeIndex === index && <i className="fas fa-arrow-right ms-auto" style={{ color: 'var(--accent-hover)' }}></i>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span><kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>↑↓</kbd> Navigate</span>
          <span><kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>↵</kbd> Open</span>
          <span>Powered by IIC</span>
        </div>

      </div>
    </div>
  );
};

export default GlobalSearch;
