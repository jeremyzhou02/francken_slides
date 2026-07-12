export const emptyForm = {
  title: "",
  description: "",
  type: "image",
  duration: 10,
  frequency: "loop",
  timesPerFrequency: 1,
  preferredTimes: [],
  calendarId: "",
  googleSheetUrl: "",
  countdownMessage: "",
  countdownMode: "daily",
  countdownDailyTime: "",
  countdownDate: "",
  countdownTime: "",
  imageUrl: "",
};

export const sheetTypes = new Set(["quote", "histogram"]);
export const maxTimesPerFrequency = 10;

export function normalizeTimesPerFrequency(value) {
  return Math.min(Math.max(Number(value) || 1, 1), maxTimesPerFrequency);
}

export function parseGoogleSheetId(sheetUrl) {
  const trimmedValue = sheetUrl.trim();
  if (!trimmedValue) return "";

  const match = trimmedValue.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];

  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  return "";
}

export function normalizeImageUrl(imageValue, baseUrl) {
  if (!imageValue) return "";
  if (imageValue.startsWith("blob:") || imageValue.startsWith("http")) {
    return imageValue;
  }
  if (imageValue.startsWith("/public/")) {
    return `${baseUrl}${imageValue}`;
  }
  return `${baseUrl}/public/${imageValue}`;
}

export function getPublicFilename(imageUrl) {
  if (!imageUrl) return "";

  try {
    const parsedUrl = new URL(imageUrl);
    const publicIndex = parsedUrl.pathname.lastIndexOf("/public/");
    if (publicIndex === -1) return "";
    return decodeURIComponent(parsedUrl.pathname.slice(publicIndex + 8));
  } catch {
    const publicIndex = imageUrl.lastIndexOf("/public/");
    if (publicIndex === -1) return "";
    return decodeURIComponent(imageUrl.slice(publicIndex + 8));
  }
}

export function settingsFromSlide(slide, baseUrl) {
  const settings = slide.settings || {};
  const storedImage =
    settings.imageUrl || settings.url || settings.filename || settings.image;

  return {
    title: slide.title || "",
    description: slide.description || "",
    type: slide.type || "image",
    duration: slide.duration || 10,
    frequency: slide.frequency || "loop",
    timesPerFrequency: settings.timesPerFrequency || 1,
    preferredTimes: slide.frequency === "daily" ? settings.preferredTimes || [] : [],
    calendarId:
      settings.calendarId || (slide.type === "agenda" ? settings.callId : "") || "",
    googleSheetUrl:
      settings.googleSheetUrl ||
      settings.sheetUrl ||
      settings.spreadsheetId ||
      (slide.type !== "agenda" ? settings.callId : "") ||
      "",
    countdownMessage: settings.message || settings.countdownMessage || "",
    countdownMode: settings.countdownMode || "daily",
    countdownDailyTime: settings.dailyTime || "",
    countdownDate: settings.targetDate || "",
    countdownTime: settings.targetTime || "",
    imageUrl: normalizeImageUrl(storedImage, baseUrl),
  };
}

export function buildSettings(form) {
  const settings = {};

  if (form.frequency !== "loop") {
    const preferredTimes =
      form.frequency === "daily"
        ? [...new Set(form.preferredTimes)].filter(Boolean)
        : [];
    settings.timesPerFrequency =
      form.frequency === "hourly"
        ? normalizeTimesPerFrequency(form.timesPerFrequency)
        : 1;
    settings.preferredTimes = preferredTimes;
  }

  if (form.type === "image") {
    settings.imageUrl = form.imageUrl;
  }

  if (form.type === "agenda") {
    settings.calendarId = form.calendarId.trim();
    settings.maxResults = 5;
  }

  if (sheetTypes.has(form.type)) {
    settings.googleSheetUrl = form.googleSheetUrl.trim();
    settings.spreadsheetId = parseGoogleSheetId(form.googleSheetUrl);
  }

  if (form.type === "countdown") {
    settings.message = form.countdownMessage.trim();
    settings.countdownMode = form.countdownMode;

    if (form.countdownMode === "daily") {
      settings.dailyTime = form.countdownDailyTime;
    } else {
      settings.targetDate = form.countdownDate;
      settings.targetTime = form.countdownTime;
    }
  }

  return settings;
}

export function validateSlideForm(form, previewUrl) {
  if (!form.title.trim()) return "Please enter a title.";
  if (!form.description.trim()) return "Please enter an internal description.";
  if (!Number(form.duration) || Number(form.duration) < 1) {
    return "Duration must be at least 1 second.";
  }
  if (form.frequency === "hourly" && Number(form.timesPerFrequency) < 1) {
    return "Times per hour must be at least 1.";
  }
  if (
    form.frequency === "hourly" &&
    Number(form.timesPerFrequency) > maxTimesPerFrequency
  ) {
    return `Times per hour cannot be higher than ${maxTimesPerFrequency}.`;
  }
  if (form.type === "image" && !previewUrl && !form.imageUrl) {
    return "Please upload an image for this slide.";
  }
  if (form.type === "agenda" && !form.calendarId.trim()) {
    return "Please enter the Google Calendar ID.";
  }
  if (sheetTypes.has(form.type)) {
    if (!form.googleSheetUrl.trim()) {
      return "Please enter the Google Sheet URL.";
    }
    if (!parseGoogleSheetId(form.googleSheetUrl)) {
      return "Please enter a valid Google Sheet URL.";
    }
  }
  if (form.type === "countdown" && form.countdownMode === "daily") {
    if (!form.countdownDailyTime) return "Please choose the daily countdown time.";
  }
  if (form.type === "countdown" && form.countdownMode === "specific") {
    if (!form.countdownDate || !form.countdownTime) {
      return "Please choose the countdown date and time.";
    }
  }

  return "";
}
