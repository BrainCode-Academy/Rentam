const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   PUT /api/agents/verify/:id
// @desc    Verify an agent (Admin only)
router.put('/verify/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.agentProfile.isVerified = true;
        user.agentProfile.status = 'approved';
        await user.save();
        
        res.json({ msg: 'Agent verified successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   GET /api/agents
// @desc    Get all agents
router.get('/', async (req, res) => {
    try {
        const agents = await User.find({ role: 'agent' }).select('-password');
        res.json(agents);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   POST /api/agents/pay-membership
// @desc    Simulate paying agent membership fee
router.post('/pay-membership', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'agent') return res.status(400).json({ msg: 'Forbidden' });

        user.agentProfile.hasPaid = true;
        await user.save();
        res.json({ msg: 'Payment successful! You can now post properties once approved by admin.' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
