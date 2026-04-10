const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['hostel', 'p-hostel', 'self-contain', 'apartment', 'flat'], required: true },
    images: [String],
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'sold', 'pending'], default: 'pending' },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', propertySchema);
