require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./backend/config/db');

const journalRoutes = require('./backend/routes/journalRoutes');
const authRoutes = require('./backend/routes/authRoutes');

const app = express();

// ✅ Connect Database
connectDB();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend', { index: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/login.html');
});

// ✅ Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
app.use('/api', journalRoutes);
app.use('/api', authRoutes);

// ✅ Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});