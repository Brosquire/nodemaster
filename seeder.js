//requiring filesystem
const fs = require("fs");
//requiring mongoose'
const mongoose = require("mongoose");
//requiring dotenv
const dotenv = require("dotenv");
//Load Models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");

//Load Environment variables
dotenv.config({ path: "./config/config.env" });

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

//Read the json files (seed files)
//seeding the bootcamps data
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);
//Seeding the Courses data
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

//Function to Import data into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    console.log(`Data Imported...`);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

//Delete data function from DB
const deletData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    console.log(`Data Deleted...`);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

//if/else asking if the data for the DB is going to be imported(-i) or deleted(-d) from the console/terminal
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deletData();
}
