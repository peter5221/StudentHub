import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginSignup from './pages/LoginSignup';
import PostListing from './pages/PostListing';
import Profile from './pages/Profile';
import ChatWindow from './components/ChatWindow';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Admin Route Component
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user || !user.is_admin) return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginSignup mode="login" />} />
          <Route path="/signup" element={<LoginSignup mode="signup" />} />
          
          <Route path="/post" element={
            <ProtectedRoute>
              <PostListing />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/chat" element={
            <ProtectedRoute>
              <div className="pt-16 h-[calc(100vh)] max-h-screen">
                <ChatWindow />
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
