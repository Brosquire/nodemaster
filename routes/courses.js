//requiring express
const express = require("express");
const router = express.Router({ mergeParams: true }); //passing mergeParams: true as an object to redirect routes below

const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deletCourse
} = require("../controllers/courses");

router
  .route("/")
  .get(getCourses)
  .post(addCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(updateCourse)
  .delete(deletCourse);

module.exports = router;
