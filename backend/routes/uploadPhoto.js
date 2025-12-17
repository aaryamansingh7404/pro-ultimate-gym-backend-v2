// routes/uploadProfilePhoto.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Ensure uploads dir exists
const uploadDir = path.join(process.cwd(), "uploads", "profilePhotos");
fs.mkdirSync(uploadDir, { recursive: true });

// multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // use userId + timestamp + ext to avoid collisions
    const userId = req.userId || "anon";
    const ext = path.extname(file.originalname);
    const name = `${userId}_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Only images (jpeg, jpg, png) are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB limit

// middleware to extract token and set req.userId
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token missing" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// POST /api/upload-profile-photo
router.post("/upload-profile-photo", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const userId = req.userId;
    const relativePath = `/uploads/profilePhotos/${req.file.filename}`; // URL path served by express.static

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Optional: delete previous photo file if you want to save disk space
    if (user.profilePhoto) {
      const prevPath = path.join(process.cwd(), user.profilePhoto);
      // prevPath likely is /uploads/profilePhotos/oldfile.jpg if stored same style
      try { if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath); } catch (e) { /* ignore */ }
    }

    user.profilePhoto = `.${relativePath}`; // store relative path like "./uploads/profilePhotos/xxx.jpg"
    await user.save();

    res.json({ success: true, message: "Profile photo uploaded", profilePhoto: user.profilePhoto });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ success: false, message: "Upload failed", error: err.message });
  }
});

// DELETE /api/remove-profile-photo
router.delete("/remove-profile-photo", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
  
      if (!user.profilePhoto) {
        return res.status(400).json({ success: false, message: "No profile photo to remove" });
      }
  
      const photoPath = path.join(process.cwd(), user.profilePhoto);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
  
      user.profilePhoto = null;
      await user.save();
  
      res.json({ success: true, message: "Profile photo removed" });
    } catch (err) {
      console.error("Remove Photo Error:", err);
      res.status(500).json({ success: false, message: "Failed to remove photo", error: err.message });
    }
  });
  

export default router;
