const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

console.log(path.join(__dirname, "../frontend"));
// Serve static files from the current directory
app.use(express.static(path.join(__dirname, "../frontend")));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.listen(PORT, () => {
    console.log(`InclusiCare Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop.');
});


const authRoutes = require('./backend/routes/authRoutes');
app.use('/api', authRoutes);