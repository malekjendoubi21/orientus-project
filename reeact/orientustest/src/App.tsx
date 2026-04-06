import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './admin/contexts/AdminAuthContext';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './admin/components/AdminLayout';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import { programService } from './services/programService';

// Lazy-loaded pages
const Home = React.lazy(() => import('./pages/Home'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmailPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const ProgramsPage = React.lazy(() => import('./pages/ProgramsPage'));
const ProgramDetailPage = React.lazy(() => import('./pages/ProgramDetailPage'));
const RecommendationsPage = React.lazy(() => import('./pages/RecommendationsPage'));
const StudentApplicationsPage = React.lazy(() => import('./pages/StudentApplicationsPage'));
const MessagesPage = React.lazy(() => import('./pages/MessagesPage'));

// Lazy-loaded admin pages
const AdminLoginPage = React.lazy(() => import('./admin/pages/AdminLoginPage'));
const AdminDashboard = React.lazy(() => import('./admin/pages/AdminDashboard'));
const AdminProfilePage = React.lazy(() => import('./admin/pages/AdminProfilePage'));
const AdminManagementPage = React.lazy(() => import('./admin/pages/AdminManagementPage'));
const AdminProgramsPage = React.lazy(() => import('./admin/pages/AdminProgramsPage'));
const ApplicationsManagementPage = React.lazy(() => import('./admin/pages/ApplicationsManagementPage'));
const ApplicationDetailsPage = React.lazy(() => import('./admin/pages/ApplicationDetailsPage'));
const AdminMessagingPage = React.lazy(() => import('./admin/pages/AdminMessagingPage'));

function YellowBanner() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToContact = () => {
    navigate('/contact');
  };

  // Don't show banner on auth pages or admin pages
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/verify-email' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <button 
      onClick={goToContact}
      className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-gray-900 py-3 px-4 text-center font-semibold shadow-lg fixed top-0 left-0 right-0 z-40 mt-20 md:mt-24 w-full hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-500 transition-all cursor-pointer"
      aria-label="Contactez-nous pour commencer vos études à l'étranger"
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
        </svg>
        <span>🎓 Your Study Abroad Journey Starts Here - Click to Contact Us!</span>
      </div>
    </button>
  );
}

function ChatWidgetWrapper() {
  const location = useLocation();

  // Ne pas afficher le widget sur les pages admin
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return <ChatWidget />;
}

/**
 * Warm-up du backend + keep-alive + prefetch des programmes.
 * Placé dans un composant séparé pour accéder au QueryClient.
 */
function BackendWarmup() {
  const queryClient = useQueryClient();

  // Réveiller le backend dès le chargement de l'app
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      fetch(`${apiUrl}/api/health`).catch(() => {});
    }
  }, []);

  // Keep-alive : ping toutes les 14 min pour éviter le cold start Render
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) return;
    const keepAlive = setInterval(() => {
      fetch(`${apiUrl}/api/health`).catch(() => {});
    }, 14 * 60 * 1000);
    return () => clearInterval(keepAlive);
  }, []);

  // Prefetch des programmes en arrière-plan (cache React Query)
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['all-programs'],
      queryFn: () => programService.getAllPrograms(),
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <ScrollToTop />
          <BackendWarmup />
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          }>
            <Routes>
            {/* Admin Routes - Separate from public site */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="programs" element={<AdminProgramsPage />} />
              <Route path="applications" element={<ApplicationsManagementPage />} />
              <Route path="applications/:id" element={<ApplicationDetailsPage />} />
              <Route path="messaging" element={<AdminMessagingPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
              <Route
                path="manage-admins"
                element={
                  <AdminProtectedRoute requireOwner>
                    <AdminManagementPage />
                  </AdminProtectedRoute>
                }
              />
            </Route>

            {/* Public Routes */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen">
                  <Navbar />
                  <YellowBanner />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/programs" element={<ProgramsPage />} />
                    <Route path="/programs/:id" element={<ProgramDetailPage />} />
                    <Route path="/recommendations" element={<RecommendationsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/my-applications" element={
                      <ProtectedRoute requiredRole="STUDENT">
                        <StudentApplicationsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/messages" element={
                      <ProtectedRoute requiredRole="STUDENT">
                        <MessagesPage />
                      </ProtectedRoute>
                    } />
                  </Routes>
                  <Footer />
                  <ChatWidgetWrapper />
                </div>
              }
            />
          </Routes>
          </Suspense>
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
