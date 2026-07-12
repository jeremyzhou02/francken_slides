// models/Slide.js
const mongoose = require("mongoose");

const SlideSchema = new mongoose.Schema(
  {
    displayId: { type: Number, unique: true },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["image", "quote", "histogram", "countdown", "agenda"],
    },
    duration: {
      type: Number,
      default: 15, // Time in seconds this slide stays on the TV screen
    },
    frequency: {
      type: String,
      required: true,
      enum: ["loop", "hourly", "daily"],
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model("Slide", SlideSchema);
