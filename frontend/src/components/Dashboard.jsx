// src/components/Dashboard.jsx
import React from "react";
import "./Dashboard.css"; // Import the stylesheet

export default function Dashboard({ onLogout }) {
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="brand-group">
            <img
              src="/francken.png"
              alt="Francken Logo"
              className="header-logo"
            />
            <h1 className="dashboard-title">Slide Rotation Dashboard</h1>
          </div>
          <button onClick={onLogout} className="logout-btn">
            🚪 Log Out
          </button>
        </header>

        <main className="workspace">
          <div className="placeholder-card">
            <h3>👋 Welcome back, Administrator</h3>
            <p>Your configuration token is secure.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
