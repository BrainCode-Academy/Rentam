const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   PUT /api/agents/apply
// @desc    Existing user applies to become an agent
router.put('/apply', auth, async (req, res) => {
    try {
        const { businessName, whatsappNumber, phone } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.role = 'agent';
        user.agentProfile = {
            businessName,
            whatsappNumber: whatsappNumber || phone,
            phone: phone,
            status: 'pending',
            isVerified: false,
            hasPaid: user.agentProfile?.hasPaid || false
        };

        await user.save();

        // Notify Admin
        const sendEmail = require('../utils/sendEmail');
        await sendEmail({
            email: 'winnerchinazor@gmail.com',
            subject: 'New Agent Application',
            message: `User ${user.name} (${user.email}) has applied to become an agent. Business: ${businessName}.`
        });

        res.json({ msg: 'Application submitted! Awaiting admin approval.', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/agents/verify/:id
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
