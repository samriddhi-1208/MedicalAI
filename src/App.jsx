import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { HealthDataProvider } from './context/HealthDataContext';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AppLayout } from './components/layout/AppLayout';

import { DashboardPage } from './pages/DashboardPage';
import { ReportUploadPage } from './pages/ReportUploadPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { HospitalFinderPage } from './pages/HospitalFinderPage';
import { MedicineReminderPage } from './pages/MedicineReminderPage';
import { EmergencySOSPage } from './pages/EmergencySOSPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
              borderRadius: '16px',
              fontSize: '13px',
              padding: '12px 16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
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

            {/* Authenticated Application Suite */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="upload" element={<ReportUploadPage />} />
              <Route path="analysis" element={<AIAnalysisPage />} />
              <Route path="hospitals" element={<HospitalFinderPage />} />
              <Route path="medicines" element={<MedicineReminderPage />} />
              <Route path="sos" element={<EmergencySOSPage />} />
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
