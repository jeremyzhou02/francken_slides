// routes/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // 1. Grab the token from the request header
  const token = req.header("token");

  // 2. Check if no token exists
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Authorization denied, please login" });
  }

  try {
    // 3. Verify token
    const cleanToken = token;
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

    // 4. Attach the user payload to the request and move forward
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};
