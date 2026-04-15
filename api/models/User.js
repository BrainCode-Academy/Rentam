const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['user', 'agent', 'admin'], default: 'user' },
    agentProfile: {
        businessName: String,
        whatsappNumber: String,
        idCardUrl: String,
        isVerified: { type: Boolean, default: false },
        hasPaid: { type: Boolean, default: false },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    },
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
