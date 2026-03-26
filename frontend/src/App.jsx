import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import GlobalSearch from './components/ui/GlobalSearch';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import ContactPage from './pages/ContactPage';
import InnovationHubPage from './pages/InnovationHubPage';
import GalleryPage from './pages/GalleryPage';
import ReportsPage from './pages/ReportsPage';
import MembersPage from './pages/MembersPage';
import AboutUsPage from './pages/AboutUsPage';
import MemberDashboardPage from './pages/MemberDashboardPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAddEventPage from './pages/admin/AdminAddEventPage';
import AdminQueriesPage from './pages/admin/AdminQueriesPage';
import AdminIdeasPage from './pages/admin/AdminIdeasPage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminMembersPage from './pages/admin/AdminMembersPage';
import AdminEmailHubPage from './pages/admin/AdminEmailHubPage';

// Placeholder Component for missing routes
const Placeholder = ({ title }) => (
  <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
    <h1>{title}</h1>
    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>This page is currently under construction. Check back later!</p>
  </div>
);

function App() {
  return (
    <Router>
      <Navbar />
      <GlobalSearch />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          
          {/* Content Pages */}
          <Route path="/innovation-hub" element={<InnovationHubPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/my-journey" element={<MemberDashboardPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/events/add" element={<AdminAddEventPage />} />
          <Route path="/admin/queries" element={<AdminQueriesPage />} />
          <Route path="/admin/ideas" element={<AdminIdeasPage />} />
          <Route path="/admin/gallery" element={<AdminGalleryPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/members" element={<AdminMembersPage />} />
          <Route path="/admin/emails" element={<AdminEmailHubPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
