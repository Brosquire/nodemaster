//requiring express
const express = require("express");
const router = express.Router({ mergeParams: true }); //passing mergeParams: true as an object to redirect routes below
//bringing in the Course model
const Courses = require("../models/Course");
//bringing in the advanced results middleware
const advancedResults = require("../middleware/advancedResults");
// Bringing in the Protected Routes from our middleware
const { protect, authorize } = require("../middleware/auth");

const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deletCourse
} = require("../controllers/courses");

router
  .route("/")
  .get(
    advancedResults(Courses, { path: "bootcamp", select: "name description" }),
    getCourses
  )
  .post(protect, authorize("publisher", "admin"), addCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize("publisher", "admin"), updateCourse)
  .delete(protect, authorize("publisher", "admin"), deletCourse);

module.exports = router;
