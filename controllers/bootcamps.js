/* Controller File for express routes middleware */

//bringing in our bootcamp models
const Bootcamp = require("../models/Bootcamp");
//requiring our asyncHandler
const asyncHandler = require("../middleware/async");

//@route  GET /api/v1/bootcamps
//@desc   GET All bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();
  return res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

//@route  GET /api/v1/bootcamps/:id
//@desc   GET single bootcamp
//@access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  //checking to see if bootcamp returns true
  if (!bootcamp) {
    return next(error);
  }
  return res.status(200).json({ success: true, data: bootcamp });
});

//@route  POST /api/v1/bootcamps
//@desc   Create a new Bootcamp
//@access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  //creating a new Bootcamp and passing the request.body as the data to save to the DB
  const bootcamp = await Bootcamp.create(req.body);
  //sending back a successful resource to the console and the data in JSON format to be accessed by the front-end
  return res.status(201).json({ success: true, data: bootcamp });
});

//@route  DELETE /api/v1/bootcamps/:id
//@desc   Delete a Bootcamp
//@access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const deletedBootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!deletedBootcamp) {
    return next(error);
  }
  return res.status(200).json({ success: true, data: {} });
});

//@route  PUT /api/v1/bootcamps/:id
//@desc   Update a Bootcamp
//@access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  //passing the arguments [id, newdata] = [id to find by, newdata entered] through the req.params/id and req.body, sequentially
  const updatedBootcamp = await Bootcamp.findByIdAndUpdate(
    req.params.id,
    req.body,
    //passing in validators through our mongoose middleware
    {
      new: true,
      runValidators: true
    }
  );
  //check if return data is true
  if (!updatedBootcamp) {
    return next(error);
  }
  return res.status(200).json({ success: true, data: updatedBootcamp });
});
