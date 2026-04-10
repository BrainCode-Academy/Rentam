require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to Database. Proceeding to seed...');

        // 1. Create Admin
        let admin = await User.findOne({ email: 'admin@rentam.com' });
        if (!admin) {
            admin = new User({
                name: 'System Admin',
                email: 'admin@rentam.com',
                password: 'password123',
                role: 'admin',
                phone: '+2348000000001'
            });
            await admin.save();
            console.log('✅ Admin account created: admin@rentam.com / password123');
        } else {
            console.log('⚠️ Admin account already exists.');
        }

        // 2. Create Test Agent
        let agent = await User.findOne({ email: 'agent@rentam.com' });
        if (!agent) {
            agent = new User({
                name: 'Test Agent',
                email: 'agent@rentam.com',
                password: 'password123',
                role: 'agent',
                phone: '+2348000000002',
                agentProfile: {
                    businessName: 'Rentam Agency Test',
                    whatsappNumber: '2348000000002',
                    isVerified: true,
                    status: 'approved'
                }
            });
            await agent.save();
            console.log('✅ Test Agent account created: agent@rentam.com / password123');
        } else {
            console.log('⚠️ Agent account already exists.');
        }

        // 3. Create Test Buyer
        let buyer = await User.findOne({ email: 'buyer@rentam.com' });
        if (!buyer) {
            buyer = new User({
                name: 'Test Buyer',
                email: 'buyer@rentam.com',
                password: 'password123',
                role: 'user',
                phone: '+2348000000003'
            });
            await buyer.save();
            console.log('✅ Test Buyer account created: buyer@rentam.com / password123');
        } else {
            console.log('⚠️ Buyer account already exists.');
        }

        console.log('🎉 Seeding complete!');
        process.exit();
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
};

seedUsers();
