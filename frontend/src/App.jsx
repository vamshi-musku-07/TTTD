import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';
import { ThemeProvider } from './context/ThemeContext';
import { GuestRoute, ProtectedRoute, AppHomeRedirect } from './components/RouteGuards';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VerifyEmailPendingPage from './pages/VerifyEmailPendingPage';
import MediaFlowLayout from './layouts/MediaFlowLayout';
import MediaFlowRouter from './pages/mediaflow/MediaFlowRouter';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function AppShell() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <MediaFlowLayout />
      </RoleProvider>
    </ThemeProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />

      <Route element={<GuestRoute />}>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verify-email-pending" element={<VerifyEmailPendingPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Navigate to="/app/events" replace />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<AppHomeRedirect />} />
          <Route path="dashboard" element={<MediaFlowRouter />} />
          <Route path="events" element={<MediaFlowRouter />} />
          <Route path="events/:eventId" element={<MediaFlowRouter />} />
          <Route path="complaints" element={<MediaFlowRouter />} />
          <Route path="footage" element={<MediaFlowRouter />} />
          <Route path="team" element={<MediaFlowRouter />} />
          <Route path="support" element={<MediaFlowRouter />} />
          <Route path="settings" element={<MediaFlowRouter />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
