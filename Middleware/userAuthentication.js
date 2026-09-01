const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

exports.setUserCookie = (user) =>
  jwt.sign(
    { userName: user.userName, userId: user._id },
    SECRET,
    { expiresIn: "1d" }
  );

exports.GetUserCookie = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch (_error) {
    return null;
  }
};

exports.authenticateUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
