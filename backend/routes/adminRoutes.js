const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
};

// @route   GET /api/admin/pending-agents
// @desc    Get all agents waiting for approval
router.get('/pending-agents', auth, isAdmin, async (req, res) => {
    try {
        const agents = await User.find({ 
            role: 'agent', 
            'agentProfile.status': 'pending' 
        }).select('-password');
        res.json(agents);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/admin/approve-agent/:id
// @desc    Approve or reject an agent
router.put('/approve-agent/:id', auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const agent = await User.findById(req.params.id);
        
        if (!agent || agent.role !== 'agent') {
            return res.status(404).json({ msg: 'Agent not found' });
        }

        agent.agentProfile.status = status;
        agent.agentProfile.isVerified = status === 'approved';
        await agent.save();

        // Notify Agent of decision
        await sendEmail({
            email: agent.email,
            subject: `Rentam Agent Account ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Hello ${agent.name}, your agent registration has been ${status} by the admin.`
        });

        res.json({ msg: `Agent ${status} successfully`, agent });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/admin/pending-properties
// @desc    Get all properties waiting for approval
router.get('/pending-properties', auth, isAdmin, async (req, res) => {
    try {
        const properties = await Property.find({ status: 'pending' }).populate('agent', 'name email');
        res.json(properties);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/admin/approve-property/:id
// @desc    Approve or reject a property
router.put('/approve-property/:id', auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.body; // 'active' or 'rejected' (using 'active' to signify approval)
        const property = await Property.findById(req.params.id).populate('agent', 'name email');
        
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        property.status = status;
        await property.save();

        // Notify Agent of decision
        await sendEmail({
            email: property.agent.email,
            subject: `Rentam Property Listing ${status === 'active' ? 'Approved' : 'Rejected'}`,
            message: `Hello ${property.agent.name}, your property listing "${property.title}" has been ${status === 'active' ? 'approved and is now live!' : 'rejected by the admin.'}`
        });

        res.json({ msg: `Property marked as ${status} successfully`, property });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
