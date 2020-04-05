//bringing in our bootcamp models
const Review = require("../models/Review");
//bringing in our bootcamp models
const Bootcamp = require("../models/Bootcamp");
//requiring our asyncHandler
const asyncHandler = require("../middleware/async");
//requiring our error response class
const ErrorResponse = require("../utils/errorResponse");

//@route    GET /api/v1/reviews
//@route    GET /api/v1/bootcamps/:bootcampId/reviews
//@desc     GET all Reviews
//@access   Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@route    GET /api/v1/reviews/:id
//@desc     GET A Single Review
//@access   Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description"
  });

  if (!review) {
    return next(
      new ErrorResponse(`No Review found with id:${req.params.id}`, 404)
    );
  }

  return res.status(200).json({ success: true, data: review });
});

//@route    POST /api/v1/bootcamps/:bootcampId/reviews
//@desc     Add Review
//@access   Private - User authentication
exports.addReview = asyncHandler(async (req, res, next) => {
  //chaining the bootcamp and user associated with the revie wpost to the re.body to be sent to the DB in the POST method
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found by id:${req.params.bootcampId}`,
        404
      )
    );
  }

  const review = await Review.create(req.body);

  return res.status(201).json({ success: true, data: review });
});

//@route    PUT /api/v1/reviews/:id
//@desc     Update Review
//@access   Private - User authentication
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review not found by id:${req.params.id}`, 404)
    );
  }

  //Check if user or admin auth
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not Authorized`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  return res.status(201).json({ success: true, data: review });
});

//@route    DELETE /api/v1/reviews/:id
//@desc     Delete Review
//@access   Private - User authentication
exports.deletReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review not found by id:${req.params.id}`, 404)
    );
  }

  //Check if user or admin auth
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not Authorized`, 401));
  }

  await review.remove();

  return res.status(201).json({ success: true, data: {} });
});
