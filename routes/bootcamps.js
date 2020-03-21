//requiring express
const express = require("express");
const router = express.Router();

//importing our routes from our route controllers
const {
  getBootcamp,
  getBootcamps,
  updateBootcamp,
  deleteBootcamp,
  createBootcamp
} = require("../controllers/bootcamps");

/*
setting our router to use the imported routes
setting the chained methods and routes to its respective API call(get, put, post, delete)
and passing the route as an argument for its respective API call
*/
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
