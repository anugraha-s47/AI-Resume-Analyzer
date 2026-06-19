// Write your code here
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      user,
    });
  } catch (err) {
    // Duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Email already registered. Please login.",
      });
    }

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || user.password !== req.body.password)
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET
  );

  res.json({ token });
};
