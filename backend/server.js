// You shouldn't be touching this unless you really want to change something very specifc.
// Created 07-07-2026 by Jeremy Zhou
// Last Updated 07-07-2026 by Jeremy Zhou.

const express = require("express"); // Import Express framework into server
const mongoose = require("mongoose"); // Import ODM libary for MongoDB
const cors = require("cors"); // Cross-Origin Resource Sharing
require("dotenv").config(); // Loads enviroment variables

const app = express(); // Initialize express

// Middleware
app.use(cors()); // Active CORS
app.use(express.json()); // Needed for JSON Bodies for incoming traffic.
app.use("/public", express.static("public")); // Handles images

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.error("Database connection error:", err));

// Basic sanity check route
app.get("/", (req, res) => res.send("API Running"));

// Routes
app.use("/api/slides", require("./routes/slides"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/uploads", require("./routes/uploads"));

// Start network
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
