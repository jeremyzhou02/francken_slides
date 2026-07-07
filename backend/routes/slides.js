// routes/slides.js
const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const Slide = require("../models/slide.js");
const protect = require("./authMiddleware");

// Initialize Google Calendar API Client
const calendar = google.calendar({
  version: "v3",
  auth: process.env.GOOGLE_API_KEY,
});

//API ENDPOINTS

// ============================================================================= //

/**
 * @route   GET /api/slides
 * @desc    Get all slides with live Google Calendar data
 * @access  Public, visble to everyone.
 */

router.get("/", async (req, res) => {
  try {
    const slides = await Slide.find().sort({ order: 1 });

    const processedSlides = await Promise.all(
      slides.map(async (slide) => {
        if (slide.type !== "agenda") return slide;

        // Update agenda
        try {
          const response = await calendar.events.list({
            calendarId: slide.settings.calendarId,
            timeMin: new Date().toISOString(),
            maxResults: slide.settings.maxResults || 5, // Show max of 5 agenda events
            singleEvents: true,
            orderBy: "startTime",
          });

          const liveItems = response.data.items.map((event) => {
            // Handle All-Day Events
            if (event.start.date) {
              const eventDate = new Date(event.start.date).toLocaleDateString(
                [],
                {
                  month: "short",
                  day: "numeric",
                },
              );
              return {
                time: `${eventDate} (All Day)`,
                event: event.summary,
              };
            }

            // Handle Specific Timestamp Events
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
          });

          // Inject live Google items into the Mongoose structure
          const slideObject = slide.toObject();
          slideObject.settings.items = liveItems;

          return slideObject;
        } catch (calendarError) {
          console.error("Google Calendar Sync Error:", calendarError.message);
        }
      }),
    );

    res.json(processedSlides);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ============================================================================= //

/**
 * @route   POST /api/slides
 * @desc    Create a new slide configuration
 * @access  Private, through admin dashboard only.
 */

router.post("/", protect, async (req, res) => {
  try {
    const { title, type, duration, order, settings } = req.body;

    const newSlide = new Slide({ title, type, duration, order, settings });
    const savedSlide = await newSlide.save();

    res.status(201).json(savedSlide);
  } catch (err) {
    res.status(400).json({ message: "Validation Error", error: err.message });
  }
});

// ============================================================================= //

/**
 * @route   DELETE /api/slides/:id
 * @desc    Delete a slide by its unique MongoDB_id
 * @access  Private, through admin dashboard only.
 */

router.delete("/:id", protect, async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({ message: "Slide not found" });
    }

    await slide.deleteOne();
    res.json({
      message: "Slide removed successfully",
      deletedId: req.params.id,
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Slide not found" });
    }
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
