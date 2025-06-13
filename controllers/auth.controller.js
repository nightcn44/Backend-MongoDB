const User = require("../models/user");
const hashPassword = require("../utils/hashPassword");
const generateToken = require("../utils/generateToken");
const validatePassword = require("../utils/validatePassword");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // 1. Input Validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // 2. Password Length Check (if not done in schema)
  //   if (password.length < 6) {
  //     return res
  //       .status(400)
  //       .json({ message: "Password must be at least 6 characters long" });
  //   }

  try {
    // 3. Check for Existing User
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or Email is already registered" });
    }

    // 4. Hash Password
    const hashedPassword = await hashPassword(password);

    // 5. Create New User Instance
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // 6. Save User to Database
    await newUser.save();

    // 7. Success Response
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Register Error:", err);
    // Check for specific Mongoose validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // 1. Input Validation
  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // 2. Find User by Username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // 3. Validate Password
    const isMatch = await validatePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Password incorrect" });
    }

    // 4. Generate JWT Token
    const token = generateToken(user);

    // 5. Success Response with Token
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
