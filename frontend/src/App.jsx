import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Medicines from './pages/Medicines';
import Routine from './pages/Routine';
import Emergency from './pages/Emergency';
import ElderProfile from './pages/ElderProfile';
import { useReminders } from './hooks/useReminders';
import ForgotPassword from './pages/ForgotPassword';

function AppContent() {
  const { user, login, loading } = useUser();
  useReminders(user);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(79,70,229,0.5)]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login setUser={login} />} />
        <Route path="/signup" element={<Signup setUser={login} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes with Layout */}
        <Route path="/chat" element={user ? <Layout><Chat user={user} /></Layout> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user ? <Layout><Dashboard user={user} /></Layout> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Layout><ElderProfile user={user} /></Layout> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Layout><Settings /></Layout> : <Navigate to="/login" />} />
        <Route path="/medicines" element={user ? <Layout><Medicines user={user} /></Layout> : <Navigate to="/login" />} />
        <Route path="/routine" element={user ? <Layout><Routine user={user} /></Layout> : <Navigate to="/login" />} />
        <Route path="/emergency" element={user ? <Layout><Emergency user={user} /></Layout> : <Navigate to="/login" />} />
        <Route path="/elder-profile" element={user ? <Layout><ElderProfile user={user} /></Layout> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
