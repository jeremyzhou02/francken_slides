// models/Slide.js
const mongoose = require("mongoose");

const SlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      // Ensure only your supported slide types can be saved
      enum: ["image", "histogram", "countdown", "agenda"],
    },
    duration: {
      type: Number,
      default: 15, // Time in seconds this slide stays on the TV screen
    },
    order: {
      type: Number,
      required: true,
    },
    // Mixed type acts as a flexible bucket.
    // The structure inside changes completely based on the 'type' field above.
    settings: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true },
); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model("Slide", SlideSchema);
