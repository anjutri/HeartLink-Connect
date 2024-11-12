const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Check if user exists
        const existingUser = await User.findOne({ email: 'anjutripathi768@gmail.com' });
        if (existingUser) {
            console.log('User already exists');
            return;
        }

        // Create user with specific credentials
        const hashedPassword = await bcrypt.hash('Test@123', 10);
        const user = new User({
            name: 'Anjali Tripathi',
            email: 'anjutripathi768@gmail.com',
            password: hashedPassword,
            role: 'user',
            bio: '5th BTECH (CSE) Student at AKS UNIVERSITY, SATNA'
        });

        await user.save();
        console.log('User created successfully with:');
        console.log('Email: anjutripathi768@gmail.com');
        console.log('Password: Test@123');
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createTestUser(); 