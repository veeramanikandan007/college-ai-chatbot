<<<<<<< HEAD
import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastContainer } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const HomePage = lazy(() => import('./pages/HomePage'));

const StudentLayout = lazy(() => import('./components/layout/StudentLayout'));
const AttendancePage = lazy(() => import('./pages/student/AttendancePage'));
const TimetablePage = lazy(() => import('./pages/student/TimetablePage'));
const AssignmentsPage = lazy(() => import('./pages/student/AssignmentsPage'));
const NotesPage = lazy(() => import('./pages/student/NotesPage'));
const NotificationsPage = lazy(() => import('./pages/student/NotificationsPage'));
const EventsPage = lazy(() => import('./pages/student/EventsPage'));
const LibraryPage = lazy(() => import('./pages/student/LibraryPage'));
const FeesPage = lazy(() => import('./pages/student/FeesPage'));
const SettingsPage = lazy(() => import('./pages/student/SettingsPage'));

const PageLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0A2A6A] border-t-transparent dark:border-[#E8B24D]"></div>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected student routes with layout */}
            <Route element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/timetable" element={<TimetablePage />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/fees" element={<FeesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Protected standalone routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SidebarProvider>
          <ToastProvider>
            <AuthProvider>
              <AnimatedRoutes />
              <ToastContainer />
            </AuthProvider>
          </ToastProvider>
        </SidebarProvider>
      </ThemeProvider>
    </ErrorBoundary>
=======
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Decorative glowing background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-[-1]">
        <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-primary/10 dark:bg-accent/15 blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-6%] h-80 w-80 rounded-full bg-secondary/10 dark:bg-primary/10 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="relative flex flex-col min-h-screen"
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
  );
}

export default App;
