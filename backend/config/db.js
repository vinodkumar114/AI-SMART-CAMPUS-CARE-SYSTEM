const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    const uri = (process.env.MONGO_URI || '').trim();
    const isMongoUri =
      uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');

    if (!isMongoUri) {
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`MongoDB (memory) Connected: ${conn.connection.host}`);
      return;
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
