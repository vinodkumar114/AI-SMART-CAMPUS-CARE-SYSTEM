require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Student = require('./models/Student');
const Counselor = require('./models/Counselor');
const CampusResource = require('./models/CampusResource');
const EnergyUsage = require('./models/EnergyUsage');
const RiskScore = require('./models/RiskScore');
const Alert = require('./models/Alert');
const connectDB = require('./config/db');

connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Student.deleteMany();
    await Counselor.deleteMany();
    await CampusResource.deleteMany();
    await EnergyUsage.deleteMany();
    await RiskScore.deleteMany();
    await Alert.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    console.log('Creating Admin...');
    await User.create({ name: 'System Admin', email: 'admin@campusai.edu', password, role: 'admin' });

    console.log('Creating Counselor...');
    const counselorUser = await User.create({ name: 'Dr. Sarah Smith', email: 'counselor@campusai.edu', password, role: 'counselor' });
    await Counselor.create({ userId: counselorUser._id, department: 'Student Wellness' });

    console.log('Creating Students and Risk Scores...');
    // Student 1 - Critical Risk
    const s1User = await User.create({ name: 'Alex Johnson', email: 'alex@campusai.edu', password, role: 'student' });
    await Student.create({ userId: s1User._id, department: 'Engineering', counselorId: counselorUser._id });
    await RiskScore.create({ studentId: s1User._id, score: 88, riskLevel: 'Critical', factors: ['Missed 3 assignments', 'Reported severe sleep deprivation', 'High stress'] });
    await Alert.create({ studentId: s1User._id, type: 'RiskThreshold', message: 'Student risk level jumped to Critical (88%) based on recent wellness check-in.' });

    // Student 2 - Medium Risk
    const s2User = await User.create({ name: 'Jamie Doe', email: 'jamie@campusai.edu', password, role: 'student' });
    await Student.create({ userId: s2User._id, department: 'Arts', counselorId: counselorUser._id });
    await RiskScore.create({ studentId: s2User._id, score: 45, riskLevel: 'Medium', factors: ['Low attendance in morning classes'] });

    // Student 3 - Low Risk
    const s3User = await User.create({ name: 'Taylor Swift', email: 'taylor@campusai.edu', password, role: 'student' });
    await Student.create({ userId: s3User._id, department: 'Music', counselorId: counselorUser._id });
    await RiskScore.create({ studentId: s3User._id, score: 10, riskLevel: 'Low', factors: [] });

    console.log('Creating Campus Resources...');
    await CampusResource.create({ resourceType: 'StudyRoom', name: 'Lib-Silent-A', capacity: 20, currentOccupancy: 18 });
    await CampusResource.create({ resourceType: 'StudyRoom', name: 'Lib-Silent-B', capacity: 20, currentOccupancy: 4 });
    await CampusResource.create({ resourceType: 'Lab', name: 'CS-Lab-3', capacity: 30, currentOccupancy: 28 });
    
    console.log('Creating Energy Usage...');
    await EnergyUsage.create({ location: 'Hostel Block A', electricityKwh: 450, waterLiters: 1200 });
    await EnergyUsage.create({ location: 'Hostel Block B', electricityKwh: 410, waterLiters: 900 });
    await EnergyUsage.create({ location: 'Library Main', electricityKwh: 320, waterLiters: 400 });

    console.log('Mock Data Seeded Successfully!');
    console.log('----------------------------------------------------');
    console.log('Test Accounts (Password for all: password123)');
    console.log('Admin: admin@campusai.edu');
    console.log('Counselor: counselor@campusai.edu');
    console.log('Student (Critical): alex@campusai.edu');
    console.log('Student (Low): taylor@campusai.edu');
    console.log('----------------------------------------------------');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
