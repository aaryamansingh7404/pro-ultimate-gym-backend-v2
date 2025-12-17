// routes/userDashboard.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Membership from "../models/Membership.js";

const router = express.Router();

router.get("/user-dashboard", async (req, res) => {
  const authHeader = req.headers.authorization;

  // Step 1: Check if token is missing
  if (!authHeader) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const token = authHeader.split(" ")[1];

  // Step 2: Verify token in try-catch
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
  } catch (err) {
    // If token is invalid or expired
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please login again." });
    } else {
      return res.status(401).json({ error: "User not logged in" });
    }
  }

  try {
    const userId = decoded.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const membership = await Membership.findOne({ email: user.email });

    res.status(200).json({ user, membership });
  } catch (error) {
    console.error("Dashboard Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/update-profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    const userId = decoded.id;

    const allowedFields = ["firstName", "lastName", "email", "phone", "address", "state", "city"];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field]) updates[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

// ✅ Chatbot Route: Membership End Date
router.get("/membership/end-date", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    const user = await User.findById(decoded.id);

    if (!user || !user.membershipStartDate || !user.membershipPlan) {
      return res.status(404).json({ message: "Membership data not found" });
    }

    const startDate = new Date(user.membershipStartDate);
    const endDate = new Date(startDate.setMonth(startDate.getMonth() + user.membershipPlan));

    res.json({ endDate: endDate.toDateString() });
  } catch (err) {
    console.error("Membership End Error:", err);
    res.status(500).json({ message: "Error fetching membership data" });
  }
});

// ✅ Chatbot Route: Assigned Coach
router.get("/coach/assigned", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    const user = await User.findById(decoded.id);

    if (!user || !user.assignedCoach) {
      return res.status(404).json({ message: "Coach data not found" });
    }

    res.json({ coach: user.assignedCoach });
  } catch (err) {
    console.error("Coach Fetch Error:", err);
    res.status(500).json({ message: "Error fetching coach data" });
  }
});



export default router;
