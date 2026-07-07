// src/components/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

export default function Login({ onLoginSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Fast local verification to catch completely empty submissions
    if (!password.trim()) {
      setError("Please enter the passphrase.");
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      // FIXED: Captured the API returned payload into the response variable
      const response = await axios.post(`${baseUrl}/api/auth/login`, {
        password,
      });

      // Now this check works perfectly!
      if (response.data.success) {
        onLoginSuccess(response.data.token);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Authentication failed. Try again.",
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Left Side: Logo Graphic Block */}
        <div className="logo-section">
          <img
            src="/francken.png"
            alt="T.F.V. 'Professor Francken' Logo"
            className="login-logo"
          />
        </div>

        {/* Right Side: Credentials Input Form */}
        <div className="form-section">
          <h2>Francken Slide Dashboard</h2>
          <p className="subtitle">
            You need to authenticate with the server in order to manage the TV
            slides. If you don't know the passphrase, then you should shout
            "Compucie!" or something similar.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="password"
                placeholder="Passphrase"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="auth-btn">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
