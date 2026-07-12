import React from "react";
import { sheetTypes } from "./slideFormUtils";

export default function TypeSettings({ form, updateField }) {
  if (form.type === "agenda") {
    return (
      <div className="form-group">
        <label>Google Calendar ID</label>
        <input
          type="text"
          placeholder="Enter Google Calendar ID"
          value={form.calendarId}
          onChange={(e) => updateField("calendarId", e.target.value)}
        />
      </div>
    );
  }

  if (sheetTypes.has(form.type)) {
    return (
      <div className="form-group">
        <label>Google Sheet URL</label>
        <input
          type="text"
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={form.googleSheetUrl}
          onChange={(e) => updateField("googleSheetUrl", e.target.value)}
        />
        <div className="field-disclaimer">
          <p>Make sure your Google Sheet is public to everyone.</p>
          {form.type === "quote" && (
            <p>
              For quotes, the first column must contain the quotes and the
              second column must contain the names.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (form.type === "countdown") {
    return (
      <div className="settings-block">
        <div className="form-group">
          <label>Countdown message</label>
          <input
            type="text"
            placeholder="Time until..."
            value={form.countdownMessage}
            onChange={(e) => updateField("countdownMessage", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Countdown mode</label>
          <select
            value={form.countdownMode}
            onChange={(e) => updateField("countdownMode", e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="specific">Specific date</option>
          </select>
        </div>

        {form.countdownMode === "daily" ? (
          <div className="form-group">
            <label>Daily time</label>
            <input
              type="time"
              value={form.countdownDailyTime}
              onChange={(e) =>
                updateField("countdownDailyTime", e.target.value)
              }
            />
          </div>
        ) : (
          <div className="inline-fields">
            <div className="form-group">
              <label>Target date</label>
              <input
                type="date"
                value={form.countdownDate}
                onChange={(e) => updateField("countdownDate", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Target time</label>
              <input
                type="time"
                value={form.countdownTime}
                onChange={(e) => updateField("countdownTime", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
