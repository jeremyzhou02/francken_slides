const { google } = require("googleapis");

const calendar = google.calendar({
  version: "v3",
  auth: process.env.GOOGLE_API_KEY,
});

const formatAgendaEvent = (event) => {
  if (event.start.date) {
    const eventDate = new Date(event.start.date).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });

    return {
      time: `${eventDate} (All Day)`,
      event: event.summary,
    };
  }

  const jsDate = new Date(event.start.dateTime);
  const dateStr = jsDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  const timeStr = jsDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    time: `${dateStr} @ ${timeStr}`,
    event: event.summary,
  };
};

const fetchAgendaItems = async (calendarId) => {
  if (!calendarId) return [];

  const response = await calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    maxResults: 5,
    singleEvents: true,
    orderBy: "startTime",
  });

  return response.data.items.map(formatAgendaEvent);
};

const addAgendaItems = async (slide) => {
  const slideObject = slide.toObject();
  if (slide.type !== "agenda") return slideObject;

  try {
    const settings = slide.settings || {};
    slideObject.settings.items = await fetchAgendaItems(
      settings.calendarId || settings.callId,
    );

    return slideObject;
  } catch (calendarError) {
    console.error("Google Calendar Sync Error:", calendarError.message);
    slideObject.settings.items = [];
    return slideObject;
  }
};

const addAgendaItemsToSlides = (slides) => Promise.all(slides.map(addAgendaItems));

module.exports = {
  addAgendaItems,
  addAgendaItemsToSlides,
  fetchAgendaItems,
};
