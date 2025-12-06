import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Bills from "./pages/Bills";
import Appliances from "./pages/Appliances";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Estimation from "./pages/Estimation";
import "./App.css";

// Route Logger Component
function RouteLogger() {
  const location = useLocation();

  useEffect(() => {
    console.log('\n' + '🎯'.repeat(40));
    console.log(`🚀 Route Changed: ${location.pathname}`);
    console.log(`📍 Full Path: ${location.pathname}${location.search}${location.hash}`);
    if (location.state) {
      console.log('📦 State:', location.state);
    }
    console.log('🎯'.repeat(40) + '\n');
  }, [location]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
              },
              success: {
                iconTheme: {
                  primary: "var(--secondary)",
                  secondary: "white",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "white",
                },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bills"
              element={
                <ProtectedRoute>
                  <Bills />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appliances"
              element={
                <ProtectedRoute>
                  <Appliances />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
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
              path="/estimation"
              element={
                <ProtectedRoute>
                  <Estimation />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
