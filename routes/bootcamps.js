//requiring express
const express = require("express");
const router = express.Router();
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

/* 
  ReRoute into other resource routers = router.use()method 
  and pass the URL query parameters into the first argument 
  and the second argument is where to connect that route to ie: courses
*/
router.use(`/:bootcampId/courses`, courseRouter);

/*
  setting our router to use the imported routes
  setting the chained methods and routes to its respective API call(get, put, post, delete)
  and passing the route as an argument for its respective API call
*/
router.route("/radius/:zipcode/:distance").get(radiusBootcamp);

router.route("/:id/photo").put(bootcampPhotoUpload);

router
  .route("/")
  .get(getBootcamps)
  .post(createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
