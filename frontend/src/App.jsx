import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import GlobalSearch from './components/ui/GlobalSearch';
import ThreeBackground from './components/ui/ThreeBackground';
import { startKeepAlive, stopKeepAlive } from './services/keepAlive';
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
import DocEnginePage from './pages/admin/DocEnginePage';
import CampaignBuilderPage from './pages/admin/CampaignBuilderPage';
import CampaignStatusPage from './pages/admin/CampaignStatusPage';

function App() {
  // Keep Render backend warm (ping every 4 min)
  useEffect(() => {
    startKeepAlive();
    return () => stopKeepAlive();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ThreeBackground />
          <Navbar />
          <GlobalSearch />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/innovation-hub" element={<InnovationHubPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/my-journey" element={<MemberDashboardPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Admin Routes — Protected */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/admin/events/add" element={<ProtectedRoute><AdminAddEventPage /></ProtectedRoute>} />
              <Route path="/admin/queries" element={<ProtectedRoute><AdminQueriesPage /></ProtectedRoute>} />
              <Route path="/admin/ideas" element={<ProtectedRoute><AdminIdeasPage /></ProtectedRoute>} />
              <Route path="/admin/gallery" element={<ProtectedRoute><AdminGalleryPage /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute><AdminReportsPage /></ProtectedRoute>} />
              <Route path="/admin/members" element={<ProtectedRoute><AdminMembersPage /></ProtectedRoute>} />
              <Route path="/admin/emails" element={<ProtectedRoute><AdminEmailHubPage /></ProtectedRoute>} />
              <Route path="/admin/doc" element={<ProtectedRoute><DocEnginePage /></ProtectedRoute>} />
              <Route path="/admin/doc/campaign/new" element={<ProtectedRoute><CampaignBuilderPage /></ProtectedRoute>} />
              <Route path="/admin/doc/campaign/:id" element={<ProtectedRoute><CampaignStatusPage /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
