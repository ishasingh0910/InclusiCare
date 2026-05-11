const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser
} = require('../controllers/authController');

// Register
router.post('/auth/register', registerUser);

// Login
router.post('/auth/login', loginUser);

module.exports = router;