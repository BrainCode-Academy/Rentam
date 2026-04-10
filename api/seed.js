require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');

const universities = [
    "University of Lagos (UNILAG)", "Obafemi Awolowo University (OAU)", "University of Nigeria Nsukka (UNN)", 
    "Ahmadu Bello University (ABU)", "Nnamdi Azikiwe University (UNIZIK)", "Nwafor Orizu College of Education, Nsugbe (NOCEN)", 
    "University of Port Harcourt (UNIPORT)", "Federal University of Technology Owerri (FUTO)", "University of Ibadan (UI)", 
    "University of Benin (UNIBEN)", "Covenant University", "Babcock University", "University of Ilorin (UNILORIN)",
    "Federal University of Technology Akure (FUTA)", "Federal University of Technology Minna (FUTMINNA)", 
    "University of Abuja (UNIABUJA)", "Bayero University Kano (BUK)", "University of Calabar (UNICAL)", 
    "University of Jos (UNIJOS)", "University of Uyo (UNIUYO)", "Lagos State University (LASU)", 
    "Olabisi Onabanjo University (OOU)", "Delta State University (DELSU)", "Rivers State University (RSU)",
    "Ambrose Alli University (AAU)", "Adekunle Ajasin University (AAUA)", "Ekiti State University (EKSU)", 
    "Nasarawa State University (NSUK)", "Kwara State University (KWASU)", "Enugu State University of Science and Technology (ESUT)",
    "Kano University of Science and Technology (KUST)", "Imo State University (IMSU)", "Kaduna State University (KASU)",
    "Abia State University (ABSU)", "Chukwuemeka Odumegwu Ojukwu University (COOU)", "University of Maiduguri (UNIMAID)",
    "Usmanu Danfodiyo University Sokoto (UDUSOK)", "Federal University of Agriculture Abeokuta (FUNAAB)", 
    "Michael Okpara University of Agriculture (MOUAU)", "Federal University of Petroleum Resources (FUPRE)",
    "Afe Babalola University (ABUAD)", "Igbo Eze North College of Education", "Federal College of Education Akoka",
    "Federal Polytechnic Nekede", "Yaba College of Technology (YABATECH)", "Kaduna Polytechnic",
    "Federal Polytechnic Oko", "Institute of Management and Technology (IMT)", "Federal Polytechnic Auchi",
    "Niger Delta University (NDU)"
];

const propertyTypes = ['hostel', 'self-contain', 'apartment', 'flat'];
const sampleImages = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for seeding...');

        // 1. Create Default Users
        let admin = await User.findOne({ email: 'admin@rentam.com' });
        if (!admin) {
            admin = await User.create({ name: 'System Admin', email: 'admin@rentam.com', password: 'password123', role: 'admin', phone: '+2348000000001' });
        }

        let agent = await User.findOne({ email: 'agent@rentam.com' });
        if (!agent) {
            agent = await User.create({
                name: 'Rentam Official Agent', email: 'agent@rentam.com', password: 'password123', role: 'agent', phone: '+2348000000002',
                agentProfile: { businessName: 'Rentam Nationwide', whatsappNumber: '2348000000002', isVerified: true, status: 'approved' }
            });
        }

        let buyer = await User.findOne({ email: 'buyer@rentam.com' });
        if (!buyer) {
            buyer = await User.create({ name: 'Test Buyer', email: 'buyer@rentam.com', password: 'password123', role: 'user', phone: '+2348000000003' });
        }

        // 2. Clear out old test properties
        await Property.deleteMany({});
        console.log('Cleared existing properties...');

        // 3. Generate exactly 2 properties for 50 Universities (100 total)
        const propertiesToInsert = [];
        for (let i = 0; i < universities.length; i++) {
            const uniName = universities[i];
            
            // Property 1
            propertiesToInsert.push({
                title: `Premium Self-Contain Near ${uniName.split(' ')[0]}`,
                description: `A highly secured self-contain located very close to ${uniName} with clean water and standard security.`,
                price: Math.floor(Math.random() * 200000) + 80000, // 80k to 280k
                location: uniName,
                type: 'self-contain',
                images: [sampleImages[i % 5]],
                agent: agent._id,
                isVerified: true,
                status: 'active'
            });

            // Property 2
            propertiesToInsert.push({
                title: `Affordable Student Hostel at ${uniName.split(' ')[0]}`,
                description: `Shared or private room in a student quarters environments for ${uniName} students.`,
                price: Math.floor(Math.random() * 80000) + 40000, // 40k to 120k
                location: uniName,
                type: 'hostel',
                images: [sampleImages[(i + 1) % 5]],
                agent: agent._id,
                isVerified: true,
                status: 'active'
            });
        }

        await Property.insertMany(propertiesToInsert);
        console.log(`✅ Successfully seeded 50 Universities with exactly 2 Properties each! (Total 100 listings)`);

        process.exit();
    } catch (err) {
        console.error('❌ Error during seeding:', err);
        process.exit(1);
    }
};

seedDatabase();
