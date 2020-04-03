const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
} = require("../controllers/auth");
// Bringing in the Protected Routes from our middleware
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", protect, getMe);

router.post("/forgotpassword", forgotPassword);

router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;
