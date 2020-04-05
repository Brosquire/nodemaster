//requiring express
const express = require("express");
const router = express.Router();
//requiring Bootcamp model
const Bootcamp = require("../models/Bootcamp");
//Bringing in Advanced Results Middleware
const advancedResults = require("../middleware/advancedResults");
// Bringing in the Protected Routes from our middleware
const { protect, authorize } = require("../middleware/auth");
//importing our routes from our route controllers
const {
  getBootcamp,
  getBootcamps,
  updateBootcamp,
  deleteBootcamp,
  createBootcamp,
  radiusBootcamp,
  bootcampPhotoUpload
} = require("../controllers/bootcamps");

//Include other resource routers
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");
/* 
  ReRoute into other resource routers = router.use()method 
  and pass the URL query parameters into the first argument 
  and the second argument is where to connect that route to ie: courses
*/
router.use(`/:bootcampId/courses`, courseRouter);
router.use(`/:bootcampId/reviews`, reviewRouter);

/*
  setting our router to use the imported routes
  setting the chained methods and routes to its respective API call(get, put, post, delete)
  and passing the route as an argument for its respective API call
*/
router.route("/radius/:zipcode/:distance").get(radiusBootcamp);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

module.exports = router;
