
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import { User, UserRole } from './types';

// Lazy load all page components for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboards = lazy(() => import('./pages/Dashboards'));
const FeesPage = lazy(() => import('./pages/FeesPage'));
const TeacherGradesPage = lazy(() => import('./pages/TeacherGradesPage'));
const StudentGradesPage = lazy(() => import('./pages/StudentGradesPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminManageClassesPage = lazy(() => import('./pages/AdminManageClassesPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const StudentCoursesPage = lazy(() => import('./pages/StudentCoursesPage'));
const ParentChildrenPage = lazy(() => import('./pages/ParentChildrenPage'));
const ParentPaymentHistoryPage = lazy(() => import('./pages/ParentPaymentHistoryPage'));
const AdminFeesPage = lazy(() => import('./pages/AdminFeesPage'));
const AdminPaymentsPage = lazy(() => import('./pages/AdminPaymentsPage'));
const TeacherClassesPage = lazy(() => import('./pages/TeacherClassesPage'));
const ParentResultsPage = lazy(() => import('./pages/ParentResultsPage'));
const SchoolLandingPage = lazy(() => import('./pages/SchoolLandingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AdmissionsPage = lazy(() => import('./pages/AdmissionsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ApplicationPage = lazy(() => import('./pages/ApplicationPage'));
const AdminApplicationsPage = lazy(() => import('./pages/AdminApplicationsPage'));
const AdminContentPage = lazy(() => import('./pages/AdminContentPage'));
const AdminMessagesPage = lazy(() => import('./pages/AdminMessagesPage'));

// Simple Admin Route Protection
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return user?.role === UserRole.Admin ? children : <div className="p-4 text-red-600">Access Denied</div>;
};

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const isPublicRoute = ['#/login', '#/admin-login', '#/forgot-password', '#/reset-password', '#/', '#/about', '#/admissions', '#/blog', '#/contact', '#/gallery', '#/apply'].some(path => window.location.hash.startsWith(path));

    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      // Redirect to dashboard after login if on a public auth page (but NOT if on landing page "/")
      // Actually, we want landing page "/" to be accessible. 
      // If user is at "/login", go to "/dashboard".
      if (['#/login', '#/admin-login'].includes(window.location.hash)) {
        navigate('/dashboard');
      }
    } else {
      localStorage.removeItem('currentUser');
      // Allow access to landing page "/" without login
      if (!isPublicRoute && window.location.hash !== '#/') {
        navigate('/login');
      }
    }
  }, [currentUser, navigate]);

  // Session Timeout Logic
  useEffect(() => {
    if (!currentUser) return; // Only track for logged-in users

    const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
    let timeoutId: number;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(async () => {
        console.log('Session timed out due to inactivity.');
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        navigate('/login');
      }, TIMEOUT_DURATION);
    };

    // Events to track activity
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Attach listeners
    const setup = () => {
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer(); // Start timer immediately
    };

    // Detach listeners
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };

    setup();
    return cleanup;
  }, [currentUser, navigate]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/" element={<SchoolLandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/admissions" element={<AdmissionsPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/apply" element={<ApplicationPage />} />
      <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/admin-login" element={<AdminLoginPage onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {currentUser ? (
        <Route element={<Layout user={currentUser} onLogout={handleLogout} />}>
          <Route path="/dashboard" element={<Dashboards user={currentUser} />} />

          {/* Admin Routes */}
          <Route path="/admin/users" element={<AdminRoute><AdminPage user={currentUser} /></AdminRoute>} />
          <Route path="/admin/manage-classes" element={<AdminRoute><AdminManageClassesPage user={currentUser} /></AdminRoute>} />
          <Route path="/admin/fees" element={<AdminRoute><AdminFeesPage /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminPaymentsPage /></AdminRoute>} />
          <Route path="/admin/applications" element={<AdminRoute><AdminApplicationsPage /></AdminRoute>} />
          <Route path="/admin/content" element={<AdminRoute><AdminContentPage /></AdminRoute>} />
          <Route path="/admin/messages" element={<AdminRoute><AdminMessagesPage /></AdminRoute>} />

          {/* Teacher Routes */}
          <Route path="/teacher/classes" element={<TeacherClassesPage user={currentUser} />} />
          <Route path="/teacher/grades" element={<TeacherGradesPage user={currentUser} />} />

          {/* Student Routes */}
          {currentUser.role === UserRole.Student && (
            <>
              <Route path="/student/grades" element={<StudentGradesPage user={currentUser} />} />
              <Route path="/student/courses" element={<StudentCoursesPage user={currentUser} />} />
            </>
          )}

          {/* Parent Routes */}
          {currentUser.role === UserRole.Parent && (
            <>
              <Route path="/parent/children" element={<ParentChildrenPage user={currentUser} />} />
              <Route path="/parent/payments" element={<ParentPaymentHistoryPage user={currentUser} />} />
              <Route path="/parent/results" element={<ParentResultsPage user={currentUser} />} />
            </>
          )}

          {/* Shared/Common Routes */}
          <Route path="/fees" element={<FeesPage user={currentUser} />} />

          {/* Catch-all route for other paths, redirecting to dashboard */}
          <Route path="*" element={<Dashboards user={currentUser} />} />
        </Route>
      ) : (
        <Route path="*" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
      )}
    </Routes>
  );
};

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <AppContent />
      </Suspense>
      <ToastContainer position="top-right" autoClose={5000} />
    </Router>
  );
};

export default App;