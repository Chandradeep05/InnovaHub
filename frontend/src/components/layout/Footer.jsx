import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer glass-panel">
      <div className="container footer-content">
        <div className="footer-section">
          <h3>IIC Innovation Cell</h3>
          <p>📍 Room 101, College Campus</p>
          <p>📧 <a href="mailto:iic@college.edu.in">iic@college.edu.in</a></p>
          <p>📞 <a href="tel:+919876543210">+91-9876543210</a></p>
          <p>🕐 Mon-Fri, 9 AM - 5 PM</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/innovation-hub">Submit Idea</Link></li>
            <li><Link to="/reports">Reports</Link></li>
            <li><Link to="/contact">FAQ</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Admin Access</h4>
          <ul>
            <li><Link to="/admin/login">Admin Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Institution's Innovation Council. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
