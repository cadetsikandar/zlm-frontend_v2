import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

import Sidebar from './components/layout/Sidebar';

// Auth
import Login    from './pages/Login';
import Register from './pages/Register';

// Core
import Dashboard    from './pages/Dashboard';
import Books        from './pages/Books';
import BookDetail   from './pages/BookDetail';
import BookSetup    from './pages/BookSetup';
import NewBook      from './pages/NewBook';
import Chapters     from './pages/Chapters';
import QAReports    from './pages/QAReports';

// Bundle & Tracking
import BundleTracker from './pages/BundleTracker';
import CountryExams  from './pages/CountryExams';
import EvidenceAlerts from './pages/EvidenceAlerts';

// Admin
import Prompts      from './pages/Prompts';
import Users        from './pages/Users';
import Analytics    from './pages/Analytics';
import DesignStudio from './pages/DesignStudio';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ color: '#f55', padding: 24, background: '#000', minHeight: '100vh' }}>
          <h1>Something went wrong.</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#fff' }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedLayout({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

function AuthLayout({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated, fetchMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchMe();
  }, []); // eslint-disable-line

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#161B2E',
              color: '#F0F4FF',
              borderRadius: '10px',
              fontSize: '0.83rem',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: { iconTheme: { primary: '#34C97A', secondary: '#161B2E' } },
            error:   { iconTheme: { primary: '#F5516A', secondary: '#161B2E' } },
            loading: { iconTheme: { primary: '#3B6FF5', secondary: '#161B2E' } },
          }}
        />
        <Routes>
          {/* ── Auth ──────────────────────────────────────── */}
          <Route path="/login"    element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

          {/* ── Core Workspace ────────────────────────────── */}
          <Route path="/dashboard"  element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/books"      element={<ProtectedLayout><Books /></ProtectedLayout>} />
          <Route path="/books/:id"  element={<ProtectedLayout><BookDetail /></ProtectedLayout>} />
          <Route path="/new-book"   element={<ProtectedLayout><NewBook /></ProtectedLayout>} />
          <Route path="/book-setup" element={<ProtectedLayout><BookSetup /></ProtectedLayout>} />
          <Route path="/chapters"   element={<ProtectedLayout><Chapters /></ProtectedLayout>} />
          <Route path="/qa"         element={<ProtectedLayout><QAReports /></ProtectedLayout>} />

          {/* ── Bundle & International ────────────────────── */}
          <Route path="/bundle-tracker"  element={<ProtectedLayout><BundleTracker /></ProtectedLayout>} />
          <Route path="/country-exams"   element={<ProtectedLayout><CountryExams /></ProtectedLayout>} />
          <Route path="/evidence-alerts" element={<ProtectedLayout><EvidenceAlerts /></ProtectedLayout>} />

          {/* ── Admin & Analytics ─────────────────────────── */}
          <Route path="/prompts"   element={<ProtectedLayout><Prompts /></ProtectedLayout>} />
          <Route path="/users"     element={<ProtectedLayout><Users /></ProtectedLayout>} />
          <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
          <Route path="/design"    element={<ProtectedLayout><DesignStudio /></ProtectedLayout>} />

          {/* ── Catch-all ─────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
