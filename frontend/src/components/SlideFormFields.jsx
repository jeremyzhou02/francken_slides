import React from "react";
import TypeSettings from "./TypeSettings";
import FrequencyFields from "./FrequencyFields";

export default function SlideFormFields({
  error,
  form,
  updateField,
  newPreferredTime,
  setNewPreferredTime,
  isSaving,
  isCreateMode,
  onCancel,
}) {
  return (
    <div className="editor-right-column">
      {error && <p className="form-error">{error}</p>}

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          placeholder="Slide Title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Type</label>
        <select
          value={form.type}
          onChange={(e) => updateField("type", e.target.value)}
        >
          <option value="image">Image</option>
          <option value="quote">Quote</option>
          <option value="histogram">Histogram</option>
          <option value="countdown">Countdown</option>
          <option value="agenda">Agenda</option>
        </select>
      </div>

      <TypeSettings form={form} updateField={updateField} />

      <div className="form-group">
        <label>Internal Description</label>
        <textarea
          rows="3"
          placeholder="Description for internal use..."
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </div>

      <FrequencyFields
        form={form}
        updateField={updateField}
        newPreferredTime={newPreferredTime}
        setNewPreferredTime={setNewPreferredTime}
      />

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-save" disabled={isSaving}>
          {isSaving ? "Saving..." : isCreateMode ? "Create Slide" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
