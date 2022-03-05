const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connection successful');
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
