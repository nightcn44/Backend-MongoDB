const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    console.error(
      "Configuration Error: JWT_SECRET is not defined in environment variables."
    );
    throw new Error("Server configuration error: JWT secret is missing.");
  }

  const payload = {
    id: user._id, // User's unique ID from MongoDB
    username: user.username,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "1h",
  });
};

module.exports = generateToken;
