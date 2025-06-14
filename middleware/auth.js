const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: User not found." });
      }

      next();
    } catch (err) {
      console.error("Auth Middleware Error:", err);

      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token has expired." });
      }
      if (err.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ message: "Unauthorized: Invalid token." });
      }
      res
        .status(500)
        .json({ message: "Internal server error during authentication." });
    }
  } else {
    res
      .status(401)
      .json({ message: "Unauthorized: No token provided or invalid format." });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(403)
        .json({ message: "Forbidden: User not authenticated." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this route.`,
      });
    }
    next();
  };
};
