const User = require("../models/User");
//requiring our asyncHandler
const asyncHandler = require("../middleware/async");

const crypto = require("crypto");

const ErrorResponse = require("../utils/errorResponse");

//Requiring our SendEmail utility using nodemailer
const sendEmail = require("../utils/sendEmail");

//@route    POST /api/v1/auth/register
//@desc     Register User
//@access   Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //Create our User
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
});

//@route    POST /api/v1/auth/login
//@desc     Login User
//@access   Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password are true
  if (!email || !password) {
    return next(
      new ErrorResponse("Please enter a valid email and password", 400)
    );
  }

  // Check for a User
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  // Verify password match
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

//@route    GET /api/vi/auth/me
//@desc     Get Logged in Users Profile
//@access   Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

//@route    PUT /api/vi/auth/updatedetails
//@desc     Update users details
//@access   Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

//@route    PUT /api/vi/auth/updatepassword
//@desc     Update Password
//@access   Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  //Check current password returns true
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is Incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@route    POST /api/vi/auth/forgotpassword
//@desc     Forgot Password
//@access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse("There is no User with that email", 404));
  }

  //Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;
  // Message to be sent in email
  const message = `You are recieving this email because you (or someone else)
   has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({ email: user.email, subject: "Password Reset", message }); //sending the email data for reset password
    return res.status(200).json({ success: true, data: "Email Sent" }); //retunr true if successful
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined; //clear the user resetPassword Token and expiration on unsuccessful request
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false }); //save the nullified data

    return next(new ErrorResponse("Email Could Not Be Sent", 500)); //return error response
  }
});

//@route    PUT /api/vi/auth/resetpassword/:resettoken
//@desc     Reset Password
//@access   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse("Invalid Token", 400));
  }

  //Set the new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get Token from model and create cookie to be sent as response with token
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwt();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 //setting expiration to env var and calculated in days (hours*minutes*seconds*miliseconds)
    ),
    httpOnly: true //cookie can only be accesed by the client side script
  };

  //setting secure flag to true for extra security when in production
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
