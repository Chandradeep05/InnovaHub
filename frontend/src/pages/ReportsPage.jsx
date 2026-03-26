import React, { useState, useEffect } from 'react';
import './ReportsPage.css';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [activeTab, setActiveTab] = useState('All'); // All, Annual, Event, Impact, Media
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, name-asc, name-desc

  const categories = ['All', 'Annual Report', 'Event Report', 'Impact Report', 'Media Coverage'];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        // Fallback dummy data if API fails or is empty
        setReports([
          { id: 1, title: 'Annual Blockbuster Report 2025', description: 'Yearly summary of all events', report_type: 'Annual Report', year: 2025, file_size: '3.4 MB', pdf_url: '#', upload_date: '2025-12-15' },
          { id: 2, title: 'Hackathon Impact Summary', event_name: 'Hackathon 2025', description: 'Impact and reach of the hackathon', report_type: 'Impact Report', year: 2025, file_size: '1.2 MB', pdf_url: '#', upload_date: '2025-10-20' },
          { id: 3, title: 'IIC Launch Event', event_name: 'Orientation', description: 'Inauguration details', report_type: 'Event Report', year: 2024, file_size: '5.6 MB', pdf_url: '#', upload_date: '2024-08-10' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique years
  const yearOptions = [...new Set(reports.map(r => r.year).filter(Boolean))].sort((a,b) => b-a);

  // Apply Filters, Search, and Sorting
  const processedReports = reports
    .filter(report => {
      const matchTab = activeTab === 'All' ? true : report.report_type === activeTab;
      const matchYear = yearFilter ? report.year?.toString() === yearFilter : true;
      const matchSearch = searchQuery.toLowerCase() 
        ? report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (report.description && report.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      return matchTab && matchYear && matchSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.upload_date || a.created_at || 0).getTime();
      const dateB = new Date(b.upload_date || b.created_at || 0).getTime();
      const nameA = a.title.toLowerCase();
      const nameB = b.title.toLowerCase();

      switch (sortBy) {
        case 'date-desc': return dateB - dateA;
        case 'date-asc': return dateA - dateB;
        case 'name-asc': return nameA.localeCompare(nameB);
        case 'name-desc': return nameB.localeCompare(nameA);
        default: return 0;
      }
    });

  return (
    <div className="reports-page page-container animate-fade-in section min-h-screen">
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div className="section-header text-center">
          <h2>Reports & Documents</h2>
          <p className="text-secondary">Access official IIC reports, event summaries, and annual publications.</p>
        </div>

        {/* Category Tabs */}
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`btn ${activeTab === cat ? 'btn-primary' : 'btn-outline-primary rounded-pill'}`} 
              onClick={() => setActiveTab(cat)}
              style={activeTab === cat ? { borderRadius: '50px' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card p-3 mb-4 d-flex flex-wrap gap-3 align-items-end">
          <div className="form-group mb-0 flex-grow-1" style={{ minWidth: '250px' }}>
            <label className="small mb-1 fw-bold text-secondary text-uppercase">Search</label>
            <div className="position-relative">
              <i className="fas fa-search position-absolute top-50 translate-middle-y ms-3 text-secondary"></i>
              <input type="text" className="form-control rounded-pill ps-5" placeholder="Search by title or description..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          
          <div className="form-group mb-0" style={{ minWidth: '150px' }}>
            <label className="small mb-1 fw-bold text-secondary text-uppercase">Year</label>
            <select className="form-select rounded-pill" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              <option value="">All Years</option>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          
          <div className="form-group mb-0" style={{ minWidth: '200px' }}>
            <label className="small mb-1 fw-bold text-secondary text-uppercase">Sort By</label>
            <select className="form-select rounded-pill" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <p className="text-secondary m-0 fw-500">
            {processedReports.length} {processedReports.length === 1 ? 'report' : 'reports'} found
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-3">Loading reports...</p></div>
        ) : processedReports.length === 0 ? (
          <div className="glass-card text-center p-5">
            <i className="fas fa-folder-open fs-1 text-secondary mb-3"></i>
            <h4>No reports found</h4>
            <p className="text-secondary">Try adjusting your filters or search query.</p>
            <button className="btn btn-outline-primary mt-2" onClick={() => { setActiveTab('All'); setSearchQuery(''); setYearFilter(''); }}>Clear All Filters</button>
          </div>
        ) : (
          <div className="row g-4">
            {processedReports.map(report => (
              <div key={report.id} className="col-md-6 col-lg-4">
                <div className="report-card glass-card h-100 d-flex flex-column p-4 position-relative transition-transform hover-lift">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded p-3" style={{ width: '48px', height: '48px' }}>
                      <i className="fas fa-file-pdf fs-4"></i>
                    </div>
                    <span className="badge bg-light text-dark border">{report.year}</span>
                  </div>
                  
                  <span className="text-primary small fw-bold mb-2">{report.report_type}</span>
                  <h4 className="mb-2" style={{ fontSize: '1.2rem', lineHeight: '1.4' }}>{report.title}</h4>
                  
                  <p className="text-secondary small mb-4 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {report.description || (report.event_name ? `Report for ${report.event_name}` : 'No description provided.')}
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                    <span className="text-secondary small">{report.file_size || 'PDF'}</span>
                    <div className="d-flex gap-2">
                       <a href={report.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light text-primary" title="View PDF">
                         <i className="fas fa-eye"></i> View
                       </a>
                       <a href={report.pdf_url} download className="btn btn-sm btn-primary" title="Download PDF" onClick={(e) => { e.preventDefault(); alert('Downloading report...'); }}>
                         <i className="fas fa-download"></i>
                       </a>
                    </div>
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

export default ReportsPage;
