const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const CommonUser = require("../models/CommonUser");  // ✅ Corrected import
const Customer = require("../models/Customer");
const Vendor = require("../models/Vendor");
const Pharmist = require("../models/Pharmist");
const Admin = require("../models/Admin");

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  try {
    const { category, name, email, password, phoneno, address, shopName } = req.body;
    
    // Check if email already exists
    const existingUser = await CommonUser.findOne({ email });  // ✅ Fixed variable name
    if (existingUser) return res.status(400).json({ msg: "User already exists" });
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate unique user ID
    const userId = new mongoose.Types.ObjectId().toString();  // ✅ Convert ObjectId to string

    // Store in common user table
    const commonUser = new CommonUser({userId,email,password:hashedPassword,});
    await commonUser.save();
    
    // Store in respective table
    let newUser;
    switch (category) {
      case "customer":
        console.log(req.body);
        newUser = new Customer({ userId, name, email, password:hashedPassword, phoneno });
        break;
      case "vendor":
        newUser = new Vendor({ userId, name, email, password:hashedPassword, phoneno, address });
        break;
      case "pharmist":
        newUser = new Pharmist({ userId, name, email, password:hashedPassword, phoneno, shopName, address });
        break;
      case "admin":
        newUser = new Admin({ userId, email, password:hashedPassword});
        break;
      default:
        return res.status(400).json({ msg: "Invalid category" });
    }

    await newUser.save();
    res.status(201).json({ msg: `${category} registered successfully`, userId });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in common users table
    const user = await CommonUser.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    let fullUser;
    switch (user.category) {
      case "customer":
        fullUser = await Customer.findOne({ userId: user.userId }).select("-password");
        break;
      case "vendor":
        fullUser = await Vendor.findOne({ userId: user.userId }).select("-password");
        break;
      case "pharmist":
        fullUser = await Pharmist.findOne({ userId: user.userId }).select("-password");
        break;
      case "admin":
        fullUser = await Admin.findOne({ userId: user.userId }).select("-password");
        break;
      default:
        return res.status(400).json({ msg: "Invalid category" });
    }

    if (!fullUser) return res.status(400).json({ msg: "User details not found" });

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user.userId, category: user.category },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ msg: "Login successful", token, category: user.category, userDetails: fullUser });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

module.exports = router;
