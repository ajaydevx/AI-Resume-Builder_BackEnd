const signInUser_Model = require("../models/userSignIn-Model");
const User = require("../models/userSignUp-Model");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

exports.userSignUp = async (req, res) => {
  try {
    const { userName, userEmail, userPassword } = req.body || {};

    if (!userName || !userEmail || !userPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = userEmail.trim().toLowerCase();
    if (userPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = new User({
      userName: userName.trim(),
      userEmail: normalizedEmail,
      userPassword,
    });

    await user.save();
    return res.status(201).json({ message: "User signed up successfully" });
  } catch (err) {
    console.error("Error in userSignUp:", err.message);

    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.userSignIn = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body || {};
    if (!userEmail || !userPassword) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await signInUser_Model(userEmail.trim().toLowerCase(), userPassword);

    if (user === "no user found" || user === "credentials are not matching") {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user === "internal server error") {
      return res.status(500).json({ message: "Internal server error" });
    }

    res.cookie("token", user, cookieOptions);
    return res.status(200).json({ message: "Signed in successfully" });
  } catch (err) {
    console.error("Error in userSignIn:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.userSignOut = (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};
