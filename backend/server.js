const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
 require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));



const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// ✅ REGISTER User
app.post('/addUser', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "❌ User already registered with this email!" });
        }

        // Save plain text password (NO hashing)
        const newUser = new User({ name, email, password });
        await newUser.save();

        console.log("✅ New User Registered:", newUser);
        res.status(201).json({ message: "success", user: newUser });

    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ message: "❌ Registration failed. Try again." });
    }
});

// ✅ LOGIN User
app.post('/loginUser', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "❌ Email not registered!" });
        }

        // Check if passwords match
        if (user.password !== password) {
            return res.status(400).json({ message: "❌ Incorrect password!" });
        }

        console.log("✅ User Logged In:", user);
        res.json({ message: "success", user });

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "❌ Login failed. Try again." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});



// Serve all frontend files outside the backend folder
app.use(express.static(path.join(__dirname, '../')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});



