const bcrypt = require("bcryptjs");

const validatePassword = async (input, hashed) => {
  try {
    const isMatch = await bcrypt.compare(input, hashed);
    return isMatch;
  } catch (err) {
    console.error("validatePassword Utility Error:", err);
    throw new Error("Error validating password during comparison.");
  }
};

module.exports = validatePassword;
