// routes/uploads.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const protect = require("./authMiddleware");

// Configure storage destination directory and unique file naming schemes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/");
  },
  filename: (req, file, cb) => {
    // Prevent filename collisions: timestamp + random salt key + original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Guardrail system checking incoming files to accept images exclusively
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Instantiated upload processor middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

//API ENDPOINTS

// ============================================================================= //

/**
 * @route   POST /api/uploads
 * @desc    Upload an asset file into the local static public folder
 * @access  Private (Requires Admin Token Verification)
 */

router.post("/", protect, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Build the fully qualified web asset address path string
    const fileUrl = `${req.protocol}://${req.get("host")}/public/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================= //

/**
 * @route   DELETE /api/uploads/:filename
 * @desc    Purge a physical media file entirely off the local server disk storage
 * @access  Private (Requires Admin Token Verification)
 */
router.delete("/:filename", protect, (req, res) => {
  const fileName = req.params.filename;

  // FIXED: Resolves paths directly from the project root execution context safely
  const filePath = path.resolve(process.cwd(), "public", fileName);

  // Structural sanity check confirming file existence before invoking systemic drops
  if (!fs.existsSync(filePath)) {
    return res
      .status(404)
      .json({ success: false, message: "File does not exist on disk" });
  }

  // Execute non-blocking asynchronous file wipe operation
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete file",
        error: err.message,
      });
    }
    res.json({
      success: true,
      message: "Physical file removed from server disk successfully",
    });
  });
});

// ============================================================================= //

/**
 * @route   GET /api/uploads
 * @desc    Get a list of all physical files stored in the public folder
 * @access  Private (Requires Admin Token Verification)
 */
router.get("/", protect, (req, res) => {
  const dirPath = path.resolve(process.cwd(), "public");

  // 1. Read all files inside the public directory
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Unable to scan directory",
          error: err.message,
        });
    }

    // 2. Filter out system hidden files (like .DS_Store on Mac) if any exist
    const filteredFiles = files.filter((file) => !file.startsWith("."));

    // 3. Map files to return both the raw filename and their fully qualified web URL addresses
    const fileList = filteredFiles.map((filename) => {
      return {
        filename: filename,
        url: `${req.protocol}://${req.get("host")}/public/${filename}`,
      };
    });

    res.json({
      success: true,
      count: fileList.length,
      files: fileList,
    });
  });
});

module.exports = router;
