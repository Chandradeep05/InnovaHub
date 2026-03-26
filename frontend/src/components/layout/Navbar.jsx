import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar glass-panel">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <img src="/gtbit-logo.png" alt="GTBIT Logo" className="nav-logo" />
          <span className="logo-text">IIC Innovates</span>
          <img src="/iic-logo.png" alt="IIC Logo" className="nav-logo" />
        </Link>
        
        {/* Desktop Menu */}
        <div className="desktop-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/events" className="nav-link">Events</Link>
          <Link to="/innovation-hub" className="nav-link">Innovation Hub</Link>
          <Link to="/gallery" className="nav-link">Gallery</Link>
          <Link to="/members" className="nav-link">Members</Link>
          <Link to="/my-journey" className="nav-link">My Journey</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </div>

        <div className="navbar-actions desktop-menu d-flex align-items-center gap-3">
          <button 
            className="search-btn d-flex align-items-center rounded-pill px-3 py-2 transition-all"
            onClick={() => window.dispatchEvent(new Event('open-global-search'))}
            title="Search (Ctrl+K)"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-secondary)', backdropFilter: 'blur(8px)' }}
          >
            <Search size={18} className="me-2" />
            <span className="small pe-2" style={{ color: 'var(--text-secondary)' }}>Search</span>
            <kbd className="small rounded px-1 fw-bold" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.15)' }}>Ctrl K</kbd>
          </button>
          <a href="https://forms.gle/uMpubandEjjDhbLH8" target="_blank" rel="noopener noreferrer" className="btn btn-primary rounded-pill">Join IIC</a>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="d-flex align-items-center d-lg-none gap-2">
          <button 
            className="search-btn bg-transparent border-0 text-dark p-2"
            onClick={() => window.dispatchEvent(new Event('open-global-search'))}
          >
            <Search size={22} />
          </button>
          <button className="mobile-toggle bg-transparent border-0 text-dark p-2" onClick={toggleMenu}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isOpen && (
        <div className="mobile-menu">
          <Link to="/" className="nav-link" onClick={toggleMenu}>Home</Link>
          <Link to="/about" className="nav-link" onClick={toggleMenu}>About Us</Link>
          <Link to="/events" className="nav-link" onClick={toggleMenu}>Events</Link>
          <Link to="/innovation-hub" className="nav-link" onClick={toggleMenu}>Innovation</Link>
          <Link to="/gallery" className="nav-link" onClick={toggleMenu}>Gallery</Link>
          <Link to="/members" className="nav-link" onClick={toggleMenu}>Members</Link>
          <Link to="/my-journey" className="nav-link" onClick={toggleMenu}>My Journey</Link>
          <Link to="/contact" className="nav-link" onClick={toggleMenu}>Contact</Link>
          <a href="https://forms.gle/uMpubandEjjDhbLH8" target="_blank" rel="noopener noreferrer" className="btn btn-primary" onClick={toggleMenu}>Join IIC</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
