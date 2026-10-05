import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { AppLayout } from '../components/shared/AppLayout';

import { DashboardPage } from '../pages/DashboardPage';
import { ReportUploadPage } from '../pages/ReportUploadPage';
import { AIAnalysisPage } from '../pages/AIAnalysisPage';
import { HealthTimelinePage } from '../pages/HealthTimelinePage';
import { HospitalFinderPage } from '../pages/HospitalFinderPage';
import { MedicineReminderPage } from '../pages/MedicineReminderPage';
import { EmergencySOSPage } from '../pages/EmergencySOSPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

import { ProtectedRoute } from '../components/shared/ProtectedRoute';
import { OnboardingRoute } from '../components/shared/OnboardingRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Marketing Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Zero-Login Public Emergency SOS Portals (Instant access, no credentials or OTP required) */}
      <Route path="/sos" element={<EmergencySOSPage />} />
      <Route path="/emergency" element={<EmergencySOSPage />} />

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
      <Route path="/onboarding" element={<Navigate to="/complete-profile" replace />} />

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
  );
};
