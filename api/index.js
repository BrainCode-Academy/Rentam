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
let MONGODB_URI = process.env.MONGODB_URI;

const startServer = async () => {
    try {
        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
            // Serve frontend statically for local testing
            app.use(express.static(path.join(__dirname, '../frontend')));
            
            // Use in-memory MongoDB if locally testing without real DB
            if (MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost') || MONGODB_URI.includes('dummy')) {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongoServer = await MongoMemoryServer.create();
                MONGODB_URI = mongoServer.getUri();
                console.log(`Using In-Memory MongoDB at ${MONGODB_URI}`);
            }
        }
        
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');
        
        // Auto-seed admin if using memory server or local
        try {
            const User = require('./models/User');
            let admin = await User.findOne({ email: 'admin@rentam.com' });
            if (!admin) {
                await User.create({ name: 'System Admin', email: 'admin@rentam.com', password: 'password123', role: 'admin', phone: '+2348000000001' });
                console.log('Admin user seeded: admin@rentam.com / password123');
            }
        } catch(err) {
            console.error('Seeding error', err);
        }

        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
            });
        }
    } catch (err) {
        console.error('Database connection error:', err);
    }
};

startServer();

module.exports = app;
