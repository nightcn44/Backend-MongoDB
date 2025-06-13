const User = require("../models/user");
const hashPassword = require("../utils/hashPassword");

/**
 * Controller function to fetch the authenticated user's profile.
 * This function assumes that req.user has been populated by an authentication middleware.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
exports.profile = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User information not available." });
    }

    const { _id, username, email, description, role } = req.user;

    res.status(200).json({
      id: _id, // Use _id as 'id' for client-side consistency
      username,
      email,
      role,
    });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Controller function to update the authenticated user's profile.
 * This function assumes that req.user has been populated by an authentication middleware.
 * Allowed updates: username, email, description, and optionally password.
 * @param {Object} req - The Express request object (req.body contains update data).
 * @param {Object} res - The Express response object.
 */
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User information not available." });
    }

    const userId = req.user._id;
    const { username, email, password } = req.body;

    const updateFields = {};

    if (username) updateFields.username = username;
    if (email) updateFields.email = email;

    if (password) {
      // if (password.length < 6) {
      //   return res.status(400).json({
      //     message: "New password must be at least 6 characters long.",
      //   });
      // }
      updateFields.password = await hashPassword(password);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("Profile Update Error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Username or email is already in use." });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Controller function to delete the authenticated user's profile.
 * This function assumes that req.user has been populated by an authentication middleware.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
exports.deleteProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User information not available." });
    }

    const userId = req.user._id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Profile deleted successfully!" });
  } catch (err) {
    console.error("Profile Delete Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Controller function to fetch all users.
 * This route should typically be restricted to admin users via middleware.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Get All Users Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
