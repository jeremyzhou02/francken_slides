// routes/slides.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Slide = require("../models/slide.js");
const protect = require("./authMiddleware");
const Counter = require("../models/counter");
const {
  addAgendaItemsToSlides,
  fetchAgendaItems,
} = require("../services/googleCalendar");
const {
  addQuoteItemsToSlides,
  fetchQuoteItems,
} = require("../services/googleSheets");
const {
  normalizeSlideSettings,
  parseGoogleSheetId,
} = require("../services/slideSettings");

//API ENDPOINTS

// ============================================================================= //

/**
 * @route   GET /api/slides
 * @desc    Get all slides with live Google Calendar data
 * @access  Public, visble to everyone.
 */

router.get("/", async (req, res) => {
  try {
    const slides = await Slide.find().sort({ displayId: 1, createdAt: 1 });
    const slidesWithAgenda = await addAgendaItemsToSlides(slides);
    const processedSlides = await addQuoteItemsToSlides(slidesWithAgenda);
    res.json(processedSlides);
  } catch (err) {
    console.error("Slides fetch error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ============================================================================= //

/**
 * @route   POST /api/slides/agenda-preview
 * @desc    Preview the next 5 events from a Google Calendar
 * @access  Private, through admin dashboard only.
 */
router.post("/agenda-preview", protect, async (req, res) => {
  try {
    const calendarId = String(req.body.calendarId || "").trim();

    if (!calendarId) {
      return res.status(400).json({ message: "Google Calendar ID required" });
    }

    const items = await fetchAgendaItems(calendarId);
    res.json({ items });
  } catch (err) {
    res.status(400).json({
      message: "Could not load events from this Google Calendar",
      error: err.message,
    });
  }
});

// ============================================================================= //

/**
 * @route   POST /api/slides/quote-preview
 * @desc    Preview quote rows from a public Google Sheet
 * @access  Private, through admin dashboard only.
 */
router.post("/quote-preview", protect, async (req, res) => {
  try {
    const spreadsheetId =
      req.body.spreadsheetId || parseGoogleSheetId(req.body.googleSheetUrl);

    if (!spreadsheetId) {
      return res
        .status(400)
        .json({ message: "Valid Google Sheet URL required" });
    }

    const items = await fetchQuoteItems(spreadsheetId);
    res.json({ items });
  } catch (err) {
    res.status(400).json({
      message: "Could not load quotes from this Google Sheet",
      error: err.message,
    });
  }
});

// ============================================================================= //

/**
 * @route   GET /api/slides/:id
 * @desc    Get one slide configuration
 * @access  Private, through admin dashboard only.
 */
router.get("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Slide not found" });
    }

    const slide = await Slide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({ message: "Slide not found" });
    }

    res.json(slide);
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
    const {
      title,
      description,
      type,
      duration,
      frequency,
      settings = {},
    } = req.body;

    const counter = await Counter.findByIdAndUpdate(
      { _id: "slideId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    const newSlide = new Slide({
      displayId: counter.seq,
      title,
      description,
      type,
      duration,
      frequency,
      settings: normalizeSlideSettings(type, frequency, settings),
    });

    const savedSlide = await newSlide.save();

    res.status(201).json(savedSlide);
  } catch (err) {
    res.status(400).json({ message: "Validation Error", error: err.message });
  }
});

// ============================================================================= //

/**
 * @route   PUT /api/slides/:id
 * @desc    Update an existing slide configuration
 * @access  Private, through admin dashboard only.
 */
router.put("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Slide not found" });
    }

    const {
      title,
      description,
      type,
      duration,
      frequency,
      settings = {},
    } = req.body;

    const updatedSlide = await Slide.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        type,
        duration,
        frequency,
        settings: normalizeSlideSettings(type, frequency, settings),
      },
      { new: true, runValidators: true },
    );

    if (!updatedSlide) {
      return res.status(404).json({ message: "Slide not found" });
    }

    res.json(updatedSlide);
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
