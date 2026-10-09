const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Fallback in-memory users store if MongoDB is not connected
const memoryUsers = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'inclusicare_jwt_secret_2026';

// 🔐 Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Check if mongoose is connected
const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// ✅ REGISTER
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (isDbConnected()) {
            const userExists = await User.findOne({ email: normalizedEmail });
            if (userExists) {
                return res.status(400).json({ error: "User already exists" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                name: name || "Friend",
                email: normalizedEmail,
                password: hashedPassword
            });
            return res.status(201).json({
                success: true,
                token: generateToken(user._id),
                name: user.name
            });
        } else {
            // In-memory fallback so registration always succeeds
            if (memoryUsers.has(normalizedEmail)) {
                return res.status(400).json({ error: "User already exists" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = {
                id: Date.now().toString(),
                name: name || "Friend",
                email: normalizedEmail,
                password: hashedPassword
            };
            memoryUsers.set(normalizedEmail, user);
            return res.status(201).json({
                success: true,
                token: generateToken(user.id),
                name: user.name
            });
        }
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: error.message });
    }
};

// 🔑 LOGIN
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (isDbConnected()) {
            const user = await User.findOne({ email: normalizedEmail });
            if (!user) {
                return res.status(400).json({ error: "Invalid credentials" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid credentials" });
            }
            return res.json({
                success: true,
                token: generateToken(user._id),
                name: user.name
            });
        } else {
            // In-memory fallback
            const user = memoryUsers.get(normalizedEmail);
            if (!user) {
                return res.status(400).json({ error: "Invalid credentials. Please register first." });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid credentials" });
            }
            return res.json({
                success: true,
                token: generateToken(user.id),
                name: user.name
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
};