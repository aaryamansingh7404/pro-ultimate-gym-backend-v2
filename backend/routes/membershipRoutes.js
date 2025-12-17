import express from "express";
import Membership from "../models/Membership.js";
import User from "../models/User.js";

const router = express.Router();

// 🟥 POST: Save membership & update user details
router.post("/membership", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      gender,
      dob,
      location,
      membershipPlan,
      startDate,
      selectedTrainer,
      selectedNutritionist,
      totalPrice,
      paymentId,
      purchasedBy
    } = req.body;

    // 🔹 Validate required fields
    if (
      !fullName || !email || !phone || !gender || !dob ||
      !location || !membershipPlan || !startDate ||
      !totalPrice || !paymentId
    ) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    // 🔹 Logic for trainer/nutritionist requirement
    const trainerRequired = membershipPlan === "Pro" || membershipPlan === "Premium";
    const nutritionistRequired = membershipPlan === "Premium";

    // 🔹 Create new membership
    const newMembership = new Membership({
      fullName,
      email,
      phone,
      gender,
      dob,
      location,
      membershipPlan,
      startDate,
      selectedTrainer: trainerRequired ? selectedTrainer : "",
      selectedNutritionist: nutritionistRequired ? selectedNutritionist : "",
      trainerRequired,
      totalPrice,
      paymentId,
      purchasedBy: purchasedBy || "Admin"
    });

    await newMembership.save();

    // 🔹 Update user details if exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.membershipPlan = membershipPlan;
      existingUser.membershipStartDate = new Date(startDate);
      existingUser.assignedCoach = trainerRequired ? (selectedTrainer || "No Coach") : "No Coach";
      existingUser.nutritionist = nutritionistRequired ? (selectedNutritionist || "No Nutritionist") : "No Nutritionist";
      await existingUser.save();
    }

    res.status(201).json({
      success: true,
      message: "Membership saved successfully!",
      membership: newMembership,
    });

  } catch (err) {
    console.error("❌ Membership Error:", err.message);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
});


//  ✅ GET all memberships (for admin dashboard)
router.get("/all-memberships", async (req, res) => {
  try {
    const memberships = await Membership.find();
    res.json(memberships);
  } catch (err) {
    console.error("❌ Error fetching memberships:", err);
    res.status(500).json({ message: "Server error fetching memberships" });
  }
});


// 🟢 GET: Fetch memberships by user email
router.get("/membership-details", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const memberships = await Membership.find({ email });

    if (!memberships.length)
      return res.status(404).json({ success: false, message: "No memberships found" });

    res.status(200).json(memberships);

  } catch (err) {
    console.error("❌ Fetch Membership Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
