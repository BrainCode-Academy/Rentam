const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the api directory
dotenv.config({ path: path.join(__dirname, '../api/.env') });

const UserSchema = new mongoose.Schema({
    email: String,
    role: String
});
const User = mongoose.model('User', UserSchema);

async function elevateAdmin() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI not found in .env");
        
        console.log("Connecting to Database...");
        await mongoose.connect(uri);
        console.log("Connected Successfully.");

        const email = 'winnerchinazor@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`SUCCESS: User ${email} has been promoted to Admin role.`);
        } else {
            console.log(`ERROR: User ${email} was not found in the database. Please sign up with this email first.`);
        }

        process.exit(0);
    } catch (err) {
        console.error("CRITICAL ERROR:", err);
        process.exit(1);
    }
}

elevateAdmin();
