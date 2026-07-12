// src/components/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header({ onLogout, title }) {
  // Needed for redirect to dashboard
  const navigate = useNavigate();

  return (
    <header className="admin-navbar-header">
      <div className="logo-square">
        <a href="#" className="logo-link">
          <img
            src="/francken_logo.svg"
            className="logo-svg"
            alt="T.F.V. Professor Francken"
            onClick={() => navigate(`/admin`)}
          />
        </a>
      </div>
      <div className="header-workspace-content-block">
        <div className="header-left-column">
          <div className="heading-brand-stack">
            <h1 className="workspace-view-title">{title}</h1>
            <div className="mint-decorative-indicator-line"></div>
          </div>
        </div>
        <div className="header-right-column">
          <div className="workflow-buttons-cluster">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="secondary-workflow-action-btn"
            >
              View TV
            </a>
            <button
              className="primary-workflow-action-btn"
              onClick={() => navigate("/admin/slides/new")}
            >
              <span className="workflow-btn-glyph">+</span> Create slide
            </button>
            <button onClick={onLogout} className="danger-workflow-action-btn">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
