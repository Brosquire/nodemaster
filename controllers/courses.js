//bringing in our bootcamp models
const Course = require("../models/Course");
//bringing in our bootcamp models
const Bootcamp = require("../models/Bootcamp");
//requiring our asyncHandler
const asyncHandler = require("../middleware/async");
//requiring our error response class
const ErrorResponse = require("../utils/errorResponse");

//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@desc     GET all bootcamps and their course
//@access   Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@route    GET /api/v1/courses/:id
//@desc     GET a single course
//@access   Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description"
  });

  if (!course) {
    return next(error);
  }

  res.status(200).json({ success: true, data: course });
});

//@route    POST /api/v1/bootcamps/:bootcampId/courses
//@desc     POST create a new course for a specific bootcamp
//@access   Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId; // setting the bootcamp field to the bootcampId to be passed as a prop to be updated

  const bootcamp = await Bootcamp.findById(req.params.bootcampId); //finding the bootcamp by its ID

  //checking if bootcamp returns true
  if (!bootcamp) {
    return next(error);
  }

  //creating new course with the bootcamp data gathered from req.body
  const course = await Course.create(req.body);

  res.status(200).json({ success: true, data: course });
});

//@route    PUT /api/v1/courses/:id
//@desc     PUT update course
//@access   Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(error);
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: course });
});

//@route    DELETE /api/v1/courses/:id
//@desc     DELETE a course
//@access   Private
exports.deletCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(error);
  }
  await course.remove();

  res.status(200).json({ success: true, data: {} });
});
