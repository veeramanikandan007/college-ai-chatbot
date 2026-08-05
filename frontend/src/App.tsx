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
const AINotesGeneratorPage = lazy(() => import('./pages/student/AINotesGeneratorPage'));
const AIOCRScannerPage = lazy(() => import('./pages/student/AIOCRScannerPage'));
const AIResumeBuilderPage = lazy(() => import('./pages/student/AIResumeBuilderPage'));
const AIWorkspacePage = lazy(() => import('./pages/student/AIWorkspacePage'));
const AttendancePage = lazy(() => import('./pages/student/AttendancePage'));
const TimetablePage = lazy(() => import('./pages/student/TimetablePage'));
const AssignmentsPage = lazy(() => import('./pages/student/AssignmentsPage'));
const QuestionPapersPage = lazy(() => import('./pages/student/QuestionPapersPage'));
const StudyPlannerPage = lazy(() => import('./pages/student/StudyPlannerPage'));
const MockInterviewsPage = lazy(() => import('./pages/student/MockInterviewsPage'));
const StudentAnalyticsPage = lazy(() => import('./pages/student/StudentAnalyticsPage'));
const FacultyPortalPage = lazy(() => import('./pages/faculty/FacultyPortalPage'));
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage'));
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

import { CommandPaletteProvider } from './context/CommandPaletteContext';
import { CommandPalette } from './components/common/CommandPalette';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SidebarProvider>
          <CommandPaletteProvider>
            <ToastProvider>
              <AuthProvider>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* ── Public routes ── */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/access-denied" element={<AccessDeniedPage />} />

                    {/* ── Student Protected routes (AppLayout with Student Sidebar) ── */}
                    <Route
                      element={
                        <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/workspaces" element={<AIWorkspacePage />} />
                      <Route path="/workspaces/:id" element={<AIWorkspacePage />} />
                      <Route path="/ai-ocr" element={<AIOCRScannerPage />} />
                      <Route path="/ocr-scanner" element={<AIOCRScannerPage />} />
                      <Route path="/ai-notes" element={<AINotesGeneratorPage />} />
                      <Route path="/notes-generator" element={<AINotesGeneratorPage />} />
                      <Route path="/documents" element={<DocumentHubPage />} />
                      <Route path="/placement" element={<PlacementHubPage />} />
                      <Route path="/placement-hub" element={<PlacementHubPage />} />
                      <Route path="/resume-builder" element={<AIResumeBuilderPage />} />
                      <Route path="/placement/resume" element={<AIResumeBuilderPage />} />
                      <Route path="/quiz" element={<QuizGeneratorPage />} />
                      <Route path="/quiz-generator" element={<QuizGeneratorPage />} />
                      <Route path="/attendance" element={<AttendancePage />} />
                      <Route path="/timetable" element={<TimetablePage />} />
                      <Route path="/assignments" element={<AssignmentsPage />} />
                      <Route path="/question-papers" element={<QuestionPapersPage />} />
                      <Route path="/study-planner" element={<StudyPlannerPage />} />
                      <Route path="/mock-interviews" element={<MockInterviewsPage />} />
                      <Route path="/analytics" element={<StudentAnalyticsPage />} />
                      <Route path="/notes" element={<NotesPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/events" element={<EventsPage />} />
                      <Route path="/library" element={<LibraryPage />} />
                      <Route path="/fees" element={<FeesPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* ── Faculty Protected routes (AppLayout with Faculty Sidebar) ── */}
                    <Route
                      element={
                        <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/faculty" element={<FacultyPortalPage />} />
                      <Route path="/faculty-portal" element={<FacultyPortalPage />} />
                    </Route>

                    {/* ── Admin Protected routes (AppLayout with Admin Sidebar) ── */}
                    <Route
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/admin" element={<AdminDashboardPage />} />
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>

                {/* Global overlays — rendered outside routes, always visible */}
                <CommandPalette />
                <FloatingVoicePlayer />
                <ToastContainer />
              </AuthProvider>
            </ToastProvider>
          </CommandPaletteProvider>
        </SidebarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
