//requiring express
const express = require("express");
const router = express.Router({ mergeParams: true }); //passing mergeParams: true as an object to redirect routes below

//bringing in the advanced results middleware
const advancedResults = require("../middleware/advancedResults");
// Bringing in the Protected Routes from our middleware
const { protect, authorize } = require("../middleware/auth");

//bringing in the User model
const User = require("../models/User");

//bringing in our controllers
const {
  getUser,
  getUsers,
  updateUser,
  createUser,
  deleteUser
} = require("../controllers/users");

router.use(protect); //anything router uses below will be a protected route
router.use(authorize("admin"));

router
  .route("/")
  .get(advancedResults(User), getUsers)
  .post(createUser);

router
  .route("/:id")
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
