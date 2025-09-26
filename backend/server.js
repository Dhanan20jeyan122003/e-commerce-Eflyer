const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Environment variables
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model('User', userSchema);

// -------------------
// API ROUTES
// -------------------

// Register User
app.post('/addUser', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "❌ User already registered with this email!" });

    const newUser = new User({ name, email, password });
    await newUser.save();

    console.log("✅ New User Registered:", newUser);
    res.status(201).json({ message: "success", user: newUser });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "❌ Registration failed. Try again." });
  }
});

// Login User
app.post('/loginUser', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "❌ Email not registered!" });
    if (user.password !== password) return res.status(400).json({ message: "❌ Incorrect password!" });

    console.log("✅ User Logged In:", user);
    res.json({ message: "success", user });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "❌ Login failed. Try again." });
  }
});

// -------------------
// SERVE FRONTEND
// -------------------

// Serve all frontend files (outside backend folder)
app.use(express.static(path.join(__dirname, '../')));

// Serve dashboard.html correctly
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard.html'));
});

// For all other routes, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
