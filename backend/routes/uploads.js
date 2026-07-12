// routes/uploads.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const protect = require("./authMiddleware");

const uploadDir = path.resolve(
  process.env.UPLOAD_DIR || path.resolve(__dirname, "..", "public"),
);
fs.mkdirSync(uploadDir, { recursive: true });

// Configure storage destination directory and unique file naming schemes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
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

const buildFileUrl = (req, filename) =>
  `${req.protocol}://${req.get("host")}/public/${filename}`;

const resolveUploadPath = (filename) => {
  const filePath = path.resolve(uploadDir, filename);
  if (!filePath.startsWith(uploadDir + path.sep)) {
    return null;
  }

  return filePath;
};

const sendUploadedFile = (req, res, message) => {
  res.status(201).json({
    success: true,
    message,
    url: buildFileUrl(req, req.file.filename),
    filename: req.file.filename,
  });
};

//API ENDPOINTS

// ============================================================================= //

/**
 * @route   POST /api/uploads
 * @desc    Upload an asset file into the local static public folder
 * @access  Private (Requires Admin Token Verification)
 */

router.post("/", protect, (req, res) => {
  upload.single("image")(req, res, (uploadError) => {
    if (uploadError) {
      console.error("Image upload failed:", uploadError);
      return res
        .status(400)
        .json({ success: false, message: uploadError.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    sendUploadedFile(req, res, "Image uploaded successfully");
  });
});

// ============================================================================= //

/**
 * @route   PUT /api/uploads/:filename
 * @desc    Replace one existing image file with a newly uploaded image
 * @access  Private (Requires Admin Token Verification)
 */
router.put("/:filename", protect, (req, res) => {
  const oldFilePath = resolveUploadPath(req.params.filename);

  if (!oldFilePath) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid filename" });
  }

  upload.single("image")(req, res, (uploadError) => {
    if (uploadError) {
      console.error("Image replacement failed:", uploadError);
      return res
        .status(400)
        .json({ success: false, message: uploadError.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    if (fs.existsSync(oldFilePath)) {
      fs.unlink(oldFilePath, (unlinkError) => {
        if (unlinkError) {
          return res.status(500).json({
            success: false,
            message: "New image uploaded, but old image could not be deleted",
            error: unlinkError.message,
            url: buildFileUrl(req, req.file.filename),
            filename: req.file.filename,
          });
        }

        sendUploadedFile(req, res, "Image replaced successfully");
      });
      return;
    }

    sendUploadedFile(req, res, "Image uploaded successfully");
  });
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
  const filePath = resolveUploadPath(fileName);

  if (!filePath) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid filename" });
  }

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
  // 1. Read all files inside the public directory
  fs.readdir(uploadDir, (err, files) => {
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
