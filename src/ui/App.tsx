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
import ProtectedRoute from './components/auth/ProtectedRoute';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
      />

      {/* Protected Routes */}
      <Route
        path="/"
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
        path="/how-we-do-it"
        element={
          <ProtectedRoute>
            <HowWeDoIt />
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
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          <AppRoutes />
          <ProgressToastContainer />
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;