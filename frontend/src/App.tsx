// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import "./index.css";

function PublicTVView() {
  return (
    <div
      style={{
        backgroundColor: "#000000",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#ffffff",
      }}
    >
      <h1>📺 TV Static Slide Rotation (Public View Loop)</h1>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(
    localStorage.getItem("adminToken") || null,
  );
  const [isInitializing, setIsInitializing] = useState(true);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("adminToken", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  // Run when website loads for first time.
  useEffect(() => {
    const checkInitialToken = async () => {
      const savedToken = localStorage.getItem("adminToken");

      if (!savedToken) {
        setIsInitializing(false);
        return;
      }

      // Token check
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        await axios.get(`${baseUrl}/api/auth/login`, {
          headers: { token: `${savedToken}` },
        });

        setToken(savedToken);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setToken(null);
      } finally {
        setIsInitializing(false);
      }
    };

    checkInitialToken();
  }, []); // Empty array ensures this never runs again after initial boot

  if (isInitializing) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <h2>Loading session...</h2>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* TV Slides */}
        <Route path="/" element={<PublicTVView />} />

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            token ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Redirects any unknown paths back to the root view */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
