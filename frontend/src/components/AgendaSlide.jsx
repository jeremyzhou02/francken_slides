import React from "react";

export default function AgendaSlide({ items = [], isPreview = false, message }) {
  return (
    <div className={isPreview ? "agenda-slide agenda-slide-preview" : "agenda-slide"}>
      <img
        src="/francken.png"
        alt=""
        className="agenda-slide-logo"
        aria-hidden="true"
      />
      <div className="agenda-slide-content">
        <h1>AGENDA</h1>
        {items.length > 0 ? (
          <ul className="agenda-event-list">
            {items.slice(0, 5).map((item, index) => (
              <li key={`${item.time}-${item.event}-${index}`}>
                <span className="agenda-event-time">{item.time}</span>
                <span className="agenda-event-title">{item.event}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="agenda-empty-message">
            {message || "No upcoming events"}
          </p>
        )}
      </div>
    </div>
  );
}
