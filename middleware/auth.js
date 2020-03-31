const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect Routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  //check for auth token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") //checking if the auth token exists and starts with "Bearer"
  ) {
    token = req.headers.authorization.split(" ")[1]; //setting token equal to header token by splitting it into an array (pulling Bearer off the token payload)
  } // else if (req.cookies.token) {
  //     token = req.cookies.token
  // }

  //Make sure cookie exists
  if (!token) {
    return next(new ErrorResponse("Not Authorized", 401));
  }

  try {
    //Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //setting user body to the decoded.id verified through the JWT token
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse("Not Authorized", 401));
  }
});

//Grant access to specific roles (publisher, user, admin)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    //check if currently logged in user = req.user if the role is included
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User Role: ${req.user.role} is unauthorized to committ this action`,
          403
        )
      );
    }
    next();
  };
};
