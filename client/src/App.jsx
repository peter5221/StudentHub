import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import PagePreloader from './components/PagePreloader';

// Pages
import Landing    from './pages/Landing';
import Home       from './pages/Home';
import LoginSignup from './pages/LoginSignup';
import PostListing from './pages/PostListing';
import Profile    from './pages/Profile';
import ChatWindow from './components/ChatWindow';
import AdminDashboard from './pages/AdminDashboard';
import Terms      from './pages/Terms';
import Privacy    from './pages/Privacy';

// ── Route guards ──────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullSpinner />;
  if (!user || !user.is_admin) return <Navigate to="/" replace />;
  return children;
}

// Redirect logged-in users away from landing/login/signup
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullSpinner />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function FullSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );
}

// ── Pages that HIDE the navbar (public marketing / legal) ─────────────────────
const NO_NAVBAR_PATHS = ['/landing', '/terms', '/privacy'];

function AppContent() {
  const location = useLocation();
  const hideNavbar = NO_NAVBAR_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* ── Public (marketing / legal) ── */}
          <Route path="/landing"  element={<Landing />} />
          <Route path="/terms"    element={<Terms />} />
          <Route path="/privacy"  element={<Privacy />} />

          {/* ── Auth (guests only) ── */}
          <Route path="/login"  element={<PublicOnlyRoute><LoginSignup mode="login"  /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><LoginSignup mode="signup" /></PublicOnlyRoute>} />

          {/* ── App (authenticated) ── */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          <Route path="/post" element={
            <ProtectedRoute><PostListing /></ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="/chat" element={
            <ProtectedRoute>
              <div className="pt-16 h-[calc(100vh)] max-h-screen">
                <ChatWindow />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />

          {/* Default: guests → landing, logged-in → home */}
          <Route path="*" element={<SmartRedirect />} />
        </Routes>
      </main>
    </div>
  );
}

function SmartRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <FullSpinner />;
  return <Navigate to={user ? '/' : '/landing'} replace />;
}

// ── Preloader wrapper ─────────────────────────────────────────────────────────
function WithPreloader() {
  const [preloading, setPreloading] = useState(true);

  useEffect(() => {
    // Show for minimum 1.8 s (matches progress bar animation)
    const timer = setTimeout(() => setPreloading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <PagePreloader show={preloading} />
      {/* Render app underneath — it becomes visible once preloader fades */}
      <AppContent />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <WithPreloader />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
