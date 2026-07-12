const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Identifier for this counter (e.g., "slideId")
  seq: { type: Number, default: 0 }, // The current integer value
});

module.exports = mongoose.model("Counter", CounterSchema);
