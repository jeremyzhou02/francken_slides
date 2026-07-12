// src/components/LoadingScreen.jsx
import React from "react";

// Just a simple loading screen.
export default function LoadingScreen() {
  return (
    <div className="loading-screen-container">
      <h2 className="loading-heading">
        Loading session
        <span className="dot-pulse">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </h2>
    </div>
  );
}
