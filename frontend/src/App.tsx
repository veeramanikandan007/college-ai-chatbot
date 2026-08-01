import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastContainer } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import FloatingVoicePlayer from './components/FloatingVoicePlayer';

// ── Layouts ────────────────────────────────────────────────────────────────
// AppLayout is the single shared layout for ALL protected routes.
// It mounts the Sidebar once and never remounts it on navigation.
const AppLayout = lazy(() => import('./components/layout/AppLayout'));

// ── Pages ──────────────────────────────────────────────────────────────────
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const HomePage = lazy(() => import('./pages/HomePage'));

const PlacementHubPage = lazy(() => import('./pages/student/PlacementHubPage'));
const QuizGeneratorPage = lazy(() => import('./pages/student/QuizGeneratorPage'));
const DocumentHubPage = lazy(() => import('./pages/student/DocumentHubPage'));
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
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0A2A6A] border-t-transparent dark:border-[#E8B24D]" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SidebarProvider>
          <ToastProvider>
            <AuthProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* ── Public routes (no sidebar, no layout) ── */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* ── Protected routes — ALL share AppLayout (Sidebar mounted once) ── */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    {/* Main chat */}
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/documents" element={<DocumentHubPage />} />
                    <Route path="/placement" element={<PlacementHubPage />} />
                    <Route path="/placement-hub" element={<PlacementHubPage />} />
                    <Route path="/quiz" element={<QuizGeneratorPage />} />
                    <Route path="/quiz-generator" element={<QuizGeneratorPage />} />

                    {/* Student portal pages */}
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/timetable" element={<TimetablePage />} />
                    <Route path="/assignments" element={<AssignmentsPage />} />
                    <Route path="/notes" element={<NotesPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/fees" element={<FeesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>

                  {/* ── Admin-only (standalone, no student sidebar) ── */}
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

              {/* Global overlays — rendered outside routes, always visible */}
              <FloatingVoicePlayer />
              <ToastContainer />
            </AuthProvider>
          </ToastProvider>
        </SidebarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
