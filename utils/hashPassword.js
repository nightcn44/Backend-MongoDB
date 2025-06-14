const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (err) {
    console.error("Hashing Error:", err);
    throw new Error("Failed to hash password. Please try again.");
  }
};

module.exports = hashPassword;
