const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes placeholder
app.get('/', (req, res) => {
    res.send('Rentam API is running...');
});

// Auth Routes
app.use('/api', require('./routes/authRoutes'));
// Property Routes
app.use('/api/properties', require('./routes/propertyRoutes'));
// Agent Routes
app.use('/api/agents', require('./routes/agentRoutes'));
// Admin Routes
app.use('/api/admin', require('./routes/adminRoutes'));
// Chat AI Routes
app.use('/api/chat', require('./routes/chatRoutes'));

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected');
        // Only start server if not running on Vercel
        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

module.exports = app;
