const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @route   POST /api/register
// @desc    Register user
router.post('/register', async (req, res) => {
    const { name, email, password, role, agentProfile } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password, role });
        
        if (role === 'agent' && agentProfile) {
            user.agentProfile = agentProfile;
        }

        await user.save();

        if (role === 'agent') {
            const sendEmail = require('../utils/sendEmail');
            await sendEmail({
                email: 'winnerchinazor@gmail.com',
                subject: 'New Agent Registration Approval Required',
                message: `A new user ${name} (${email}) has applied to become an agent. Please log in to the admin panel to review and approve their ID.`
            });
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, msg: role === 'agent' ? 'Registered! An admin must verify your ID before you can post.' : 'Registered successfully' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/login
// @desc    Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
