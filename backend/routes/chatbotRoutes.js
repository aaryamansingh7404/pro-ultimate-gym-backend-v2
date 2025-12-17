import express from "express";
import jwt from "jsonwebtoken";
import Membership from "../models/Membership.js";

const router = express.Router();

// ✅ Membership End Date from Membership Collection
router.post("/membership/end-date", async (req, res) => {
  try {
    const { token, email } = req.body;
    if (!token || !email) return res.status(401).json({ message: "Token or email missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");

    const membership = await Membership.findOne({ email: email });
    if (!membership) return res.status(404).json({ message: "Membership data not found" });

    const startDate = new Date(membership.startDate);
    const months = parseInt(membership.membershipPlan);
    const endDate = new Date(startDate.setMonth(startDate.getMonth() + months));

    res.json({ endDate: endDate.toDateString() });
    
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Your token has expired. Please login again." });
    }
    console.error("Membership End Error:", err);
    res.status(500).json({ message: "Error fetching membership data" });
  }
});



// ✅ Assigned Coach from Membership Collection

router.post("/coach/assigned", async (req, res) => {
  try {
    const { token, email } = req.body;
    if (!token || !email) return res.status(401).json({ message: "Token or email missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");

    const membership = await Membership.findOne({ email: email });
    if (!membership || !membership.selectedTrainer) {
      return res.status(404).json({ message: "Coach data not found" });
    }

    res.json({ coach: membership.selectedTrainer });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Your token has expired. Please login again." });
    }
    console.error("Coach Fetch Error:", err);
    res.status(500).json({ message: "Error fetching coach data" });
  }
});

export default router;
