import React from "react";

export default function FrequencyFields({
  form,
  updateField,
  newPreferredTime,
  setNewPreferredTime,
}) {
  const canUsePreferredTimes = form.frequency === "daily";
  const canSetTimesPerFrequency = form.frequency === "hourly";

  const updateFrequency = (frequency) => {
    updateField("frequency", frequency);

    if (frequency === "daily") {
      updateField("timesPerFrequency", 1);
    }

    if (frequency !== "daily") {
      updateField("preferredTimes", []);
      setNewPreferredTime("");
    }
  };

  const updateTimesPerFrequency = (value) => {
    const nextValue = Math.min(Math.max(Number(value) || 1, 1), 10);
    updateField("timesPerFrequency", nextValue);
  };

  const addPreferredTime = () => {
    if (!newPreferredTime || form.preferredTimes.includes(newPreferredTime)) {
      return;
    }

    updateField("preferredTimes", [...form.preferredTimes, newPreferredTime]);
    updateField("timesPerFrequency", 1);
    setNewPreferredTime("");
  };

  const removePreferredTime = (time) => {
    updateField(
      "preferredTimes",
      form.preferredTimes.filter((item) => item !== time),
    );
  };

  return (
    <>
      <div className="inline-fields">
        <div className="form-group">
          <label>Frequency</label>
          <select
            value={form.frequency}
            onChange={(e) => updateFrequency(e.target.value)}
          >
            <option value="loop">Loop</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
          </select>
        </div>

        <div className="form-group">
          <label>Duration (seconds)</label>
          <input
            type="number"
            min="1"
            value={form.duration}
            onChange={(e) => updateField("duration", e.target.value)}
          />
        </div>
      </div>

      {form.frequency !== "loop" && (
        <div className="settings-block">
          {canSetTimesPerFrequency && (
            <div className="form-group">
              <label>Times per hour</label>
              <input
                type="number"
                min="1"
                max="10"
                value={form.timesPerFrequency}
                onChange={(e) => updateTimesPerFrequency(e.target.value)}
              />
            </div>
          )}

          {canUsePreferredTimes && (
            <div className="form-group">
              <label>Preferred times</label>
              <div className="time-entry-row">
                <input
                  type="time"
                  value={newPreferredTime}
                  onChange={(e) => setNewPreferredTime(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={addPreferredTime}
                >
                  Add
                </button>
              </div>
              {form.preferredTimes.length > 0 && (
                <div className="time-chip-list">
                  {form.preferredTimes.map((time) => (
                    <button
                      type="button"
                      className="time-chip"
                      key={time}
                      onClick={() => removePreferredTime(time)}
                    >
                      {time} x
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
