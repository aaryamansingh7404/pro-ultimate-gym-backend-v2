import express from "express";
import Contact from "../models/Contact.js";
const router = express.Router();

router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();
    res.status(201).json({ success: true, message: "Contact message saved!" });
  } catch (error) {
    console.error("Contact Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// module.exports = router;
export default router;