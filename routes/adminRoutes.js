const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


const router = express.Router();

// Register vendor (Admin only)
router.post("/register-vendor", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Access denied" });

    const { name, email, phone, password, address, shopName } = req.body;

    // Check if vendor exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Vendor already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create vendor
    const vendor = new User({ name, email, phone, password: hashedPassword, address, role: "vendor", shopName });

    await vendor.save();
    res.status(201).json({ msg: "Vendor registered successfully" });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

module.exports = router;
