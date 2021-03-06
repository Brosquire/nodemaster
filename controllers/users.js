const User = require("../models/User");
//requiring our asyncHandler
const asyncHandler = require("../middleware/async");

const ErrorResponse = require("../utils/errorResponse");

//@route    GET /api/v1/auth/users
//@desc     Get All users
//@access   Private / Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@route    GET /api/v1/auth/users/:id
//@desc     Get Single users
//@access   Private / Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  return res.status(200).json({ success: true, data: user });
});

//@route    POST /api/v1/auth/users
//@desc     Create A User
//@access   Private / Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({ success: true, data: user });
});

//@route    PUT /api/v1/auth/users/:id
//@desc     Update A User
//@access   Private / Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: user });
});

//@route    DELETE /api/v1/auth/users/:id
//@desc     Create A User
//@access   Private / Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});
