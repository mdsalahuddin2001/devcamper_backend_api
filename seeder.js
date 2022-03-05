const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

// load model
const Bootcamp = require('./model/Bootcamp');
const Course = require('./model/Course');
const User = require('./model/User');
const Review = require('./model/Review');
// connect to DB

mongoose.connect(process.env.MONGO_URI);

// Read JSON file for bootcamps
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
// Read JSON file for courses
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);
// Read JSON file for users
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);
// Read JSON file for reviews
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
);
// import into db
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);
    console.log('Data Imported...');

    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data deleted...');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
