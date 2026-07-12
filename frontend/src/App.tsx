import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import LoadingScreen from "./components/Loadingscreen";
import SlideEditor from "./components/SlideEditor";
import PublicTVView from "./components/PublicTVView";
import "./index.css";

function AppRoutes({
  token,
  isInitializing,
  onLoginSuccess,
  onLogout,
}: {
  token: string | null;
  isInitializing: boolean;
  onLoginSuccess: (newToken: string) => void;
  onLogout: () => void;
}) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isInitializing && isAdminRoute) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* TV Slides */}
      <Route path="/" element={<PublicTVView />} />
      {/* Admin dashboard */}
      <Route
        path="/admin"
        element={
          token ? (
            <Dashboard token={token} onLogout={onLogout} />
          ) : (
            <Login onLoginSuccess={onLoginSuccess} />
          )
        }
      />
      <Route
        path="/admin/slides/:id"
        element={
          token ? (
            <SlideEditor token={token} onLogout={onLogout} />
          ) : (
            <Navigate to="/admin" replace />
          )
        }
      />
      {/* Redirect any unknown paths to TV Slides */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("adminToken") || null,
  );
  const [isInitializing, setIsInitializing] = useState(true);

  // Handle succesfull login
  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem("adminToken", newToken);
    setToken(newToken);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  // Loading screen, token verifcation
  useEffect(() => {
    const checkInitialToken = async () => {
      const savedToken = localStorage.getItem("adminToken");

      if (!savedToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        await axios.get(`${baseUrl}/api/auth/login`, {
          headers: { token: `${savedToken}` },
        });

        setToken(savedToken);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error(err.response?.data || err.message);
        } else {
          console.error(err);
        }
        setToken(null);
      } finally {
        setIsInitializing(false);
      }
    };

    checkInitialToken();
  }, []);

  return (
    <Router>
      <AppRoutes
        token={token}
        isInitializing={isInitializing}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    </Router>
  );
}
