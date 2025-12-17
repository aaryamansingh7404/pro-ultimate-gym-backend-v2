import UserModel from "../models/userSchema.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); 

class UserController {
  static createUserDoc = async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      address,
      phone,
      state,
      city,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !state || !city) {
      return res.status(400).json({ error: "Please fill all required fields." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    try {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new UserModel({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        address,
        phone,
        state,
        city,
      });

      const savedUser = await newUser.save();

      const userResponse = {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
      };

      res.status(201).json({
        message: "Signup successful",
        user: userResponse,
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };

  static verifyLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please fill all required fields." });
    }

    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid email or password." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password." });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const userResponse = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      res.status(200).json({
        message: "Login successful",
        token,
        user: userResponse,
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };
}

export default UserController;