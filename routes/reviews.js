//requiring express
const express = require("express");
const router = express.Router({ mergeParams: true }); //passing mergeParams: true as an object to redirect routes below
//bringing in the Course model
const Review = require("../models/Review");
//bringing in the advanced results middleware
const advancedResults = require("../middleware/advancedResults");
// Bringing in the Protected Routes from our middleware
const { protect, authorize } = require("../middleware/auth");

const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deletReview
} = require("../controllers/reviews");

router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "bootcamp",
      select: "name description"
    }),
    getReviews
  )
  .post(protect, authorize("user", "admin"), addReview);

router
  .route("/:id")
  .get(getReview)
  .put(protect, authorize("user", "admin"), updateReview)
  .delete(protect, authorize("user", "admin"), deletReview);

module.exports = router;
