require('dotenv').config();

const express = require('express');
const path = require('path');
const connectDB = require('./backend/config/db');

const journalRoutes = require('./backend/routes/journalRoutes');

const app = express();

// ✅ Connect Database
connectDB();

// ✅ Middleware
app.use(express.static('frontend', { index: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/login.html');
});
app.use(express.json());

// ✅ Routes
app.use('/api', journalRoutes);

// ✅ Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


const authRoutes = require('./backend/routes/authRoutes');
app.use('/api', authRoutes);