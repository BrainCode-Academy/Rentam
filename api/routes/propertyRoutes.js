const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @route   GET /api/properties
// @desc    Get all properties (with filtering)
router.get('/', async (req, res) => {
    try {
        const { location, type, minPrice, maxPrice } = req.query;
        let query = { status: 'active' };
        if (location) query.location = new RegExp(location, 'i');
        if (type) query.type = type;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const properties = await Property.find(query).populate('agent', 'name phone');
        res.json(properties);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   POST /api/properties
// @desc    Add new property (Agent only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'agent') return res.status(403).json({ msg: 'Only agents can list properties' });
    try {
        const newProperty = new Property({
            ...req.body,
            agent: req.user.id
        });
        const property = await newProperty.save();

        // Send Email Notification to Admin (winnerchinazor@gmail.com)
        await sendEmail({
            email: 'winnerchinazor@gmail.com',
            subject: 'New Property Pending Approval',
            message: `A new property listing "${property.title}" has been added by Agent ID: ${req.user.id} and is awaiting your approval.`
        });

        res.json({ msg: 'Property submitted successfully and is pending admin approval', property });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/properties/:id/request
// @desc    User requests a house
router.post('/:id/request', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('agent', 'email name');
        if (!property) return res.status(404).json({ msg: 'Property not found' });

        const user = await User.findById(req.user.id);

        // Notify Agent
        await sendEmail({
            email: property.agent.email,
            subject: 'New House Request on Rentam!',
            message: `Hello ${property.agent.name},\n\nUser ${user.name} (${user.email}, ${user.phone}) is interested in your property: "${property.title}". Please contact them.`
        });

        // Notify Admin
        await sendEmail({
            email: 'winnerchinazor@gmail.com',
            subject: 'System Alert: New House Request',
            message: `User ${user.name} requested property "${property.title}" listed by Agent ${property.agent.name}.`
        });

        res.json({ msg: 'Request sent successfully! The agent will contact you soon.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/properties/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ msg: 'Property not found' });
        
        // Admin or the agent who posted it can delete
        if (req.user.role !== 'admin' && property.agent.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await property.deleteOne();
        res.json({ msg: 'Property removed' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
