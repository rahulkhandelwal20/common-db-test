const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

  // 🔥 FIX: custom header use karo
  const token = req.headers["access-token"];

  if (!token) {
    return res.status(401).json({
      message: "Token required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // ✅ important
    next();

  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    /*
     * --------------------------------------------------
     * 1. Authentication Check
     * --------------------------------------------------
     */

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    /*
     * --------------------------------------------------
     * 2. No Role Restriction
     * --------------------------------------------------
     */

    if (allowedRoles.length === 0) {
      return next();
    }

    /*
     * --------------------------------------------------
     * 3. Role Check
     * --------------------------------------------------
     */

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource.",
      });
    }

    return next();
  };
};

module.exports = {
    authMiddleware,
    roleMiddleware
};