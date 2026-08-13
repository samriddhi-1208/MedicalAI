import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { HealthDataProvider, useHealthData } from './context/HealthDataContext';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AppLayout } from './components/layout/AppLayout';

import { DashboardPage } from './pages/DashboardPage';
import { ReportUploadPage } from './pages/ReportUploadPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { HealthTimelinePage } from './pages/HealthTimelinePage';
import { HospitalFinderPage } from './pages/HospitalFinderPage';
import { MedicineReminderPage } from './pages/MedicineReminderPage';
import { EmergencySOSPage } from './pages/EmergencySOSPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Guard for Authenticated & Profile-Completed Users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loadingAuth, userProfile } = useHealthData();

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1A4B84] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Force onboarding if profile is incomplete
  if (userProfile && !userProfile.profileCompleted) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

// Route Guard for Onboarding (/complete-profile)
const OnboardingRoute = ({ children }) => {
  const { isAuthenticated, loadingAuth, userProfile } = useHealthData();

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1A4B84] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user has already completed onboarding, send to dashboard
  if (userProfile && userProfile.profileCompleted) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <HealthDataProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1A4B84',
              color: '#F8FAFC',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              fontSize: '13px',
              padding: '12px 16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }
          }}
        />

        <BrowserRouter>
          <Routes>
            {/* Public Marketing Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Onboarding Health Profile Setup Route */}
            <Route path="/complete-profile" element={
              <OnboardingRoute>
                <OnboardingPage />
              </OnboardingRoute>
            } />

            {/* Authenticated Protected Suite */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="upload" element={<ReportUploadPage />} />
              <Route path="analysis" element={<AIAnalysisPage />} />
              <Route path="trends" element={<HealthTimelinePage />} />
              <Route path="hospitals" element={<HospitalFinderPage />} />
              <Route path="medicines" element={<MedicineReminderPage />} />
              <Route path="sos" element={<EmergencySOSPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </HealthDataProvider>
    </ThemeProvider>
  );
}
