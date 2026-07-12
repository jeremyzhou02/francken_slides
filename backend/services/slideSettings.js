const sheetTypes = new Set(["quote", "histogram"]);
const maxTimesPerFrequency = 10;

const normalizeTimesPerFrequency = (value) =>
  Math.min(Math.max(Number(value) || 1, 1), maxTimesPerFrequency);

const normalizePreferredTimes = (preferredTimes) => {
  if (!Array.isArray(preferredTimes)) return [];

  return [...new Set(preferredTimes)]
    .map((time) => String(time || "").trim())
    .filter(Boolean);
};

const parseGoogleSheetId = (sheetUrl) => {
  const trimmedValue = String(sheetUrl || "").trim();
  if (!trimmedValue) return "";

  const match = trimmedValue.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];

  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  return "";
};

const normalizeSlideSettings = (type, frequency, settings = {}) => {
  const preferredTimes =
    frequency === "daily" ? normalizePreferredTimes(settings.preferredTimes) : [];
  const scheduleSettings = {
    ...settings,
    timesPerFrequency:
      frequency === "hourly"
        ? normalizeTimesPerFrequency(settings.timesPerFrequency)
        : 1,
    preferredTimes,
  };

  if (type === "agenda") {
    return {
      ...scheduleSettings,
      calendarId: String(settings.calendarId || settings.callId || "").trim(),
      maxResults: 5,
    };
  }

  if (sheetTypes.has(type)) {
    const googleSheetUrl = String(
      settings.googleSheetUrl || settings.sheetUrl || settings.callId || "",
    ).trim();

    return {
      ...scheduleSettings,
      googleSheetUrl,
      spreadsheetId: parseGoogleSheetId(
        googleSheetUrl || settings.spreadsheetId,
      ),
    };
  }

  return scheduleSettings;
};

module.exports = {
  normalizeSlideSettings,
  parseGoogleSheetId,
  sheetTypes,
};
