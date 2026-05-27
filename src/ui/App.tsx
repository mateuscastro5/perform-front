import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { ProgressToastContainer } from './components/ui/ProgressToastContainer';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Squads from './pages/Squads';
import DeveloperProfile from './pages/DeveloperProfile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ComplexityDashboard from './pages/ComplexityDashboard';
import SquadXRayView from './pages/SquadXRayView';
import HowWeDoIt from './pages/HowWeDoIt';
import Landing from './pages/Landing';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { CommandPaletteProvider } from './components/CommandPalette';

function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/how-we-do-it" element={<HowWeDoIt />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/squads"
        element={
          <ProtectedRoute>
            <Squads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer/:id"
        element={
          <ProtectedRoute>
            <DeveloperProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/complexity"
        element={
          <ProtectedRoute>
            <ComplexityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/squad/:id/xray"
        element={
          <ProtectedRoute>
            <SquadXRayView />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          <CommandPaletteProvider>
            <AppRoutes />
            <ProgressToastContainer />
          </CommandPaletteProvider>
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
