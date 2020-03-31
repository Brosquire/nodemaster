const User = require("../models/User");
//requiring our asyncHandler
const asyncHandler = require("../middleware/async");

const ErrorResponse = require("../utils/errorResponse");

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

//@route    GET /api/vi/auth/me
//@desc     Get User
//@access   Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  return res.status(200).json({ success: true, data: user });
});
