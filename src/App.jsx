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

// Protected Route Guard for Authenticated Users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useHealthData();
  const hasToken = Boolean(localStorage.getItem('medguardian_jwt_token') || localStorage.getItem('medguardian_token'));

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route Guard for Onboarding (/complete-profile)
const OnboardingRoute = ({ children }) => {
  const { isAuthenticated, userProfile } = useHealthData();
  const hasToken = Boolean(localStorage.getItem('medguardian_jwt_token') || localStorage.getItem('medguardian_token'));

  if (!isAuthenticated && !hasToken) {
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
              background: '#0F172A',
              color: '#F8FAFC',
              border: '1px solid #1E293B',
              borderRadius: '8px',
              fontSize: '13px',
              padding: '12px 16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
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
