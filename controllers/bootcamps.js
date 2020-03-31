/* Controller File for express routes middleware */

//bringing in our bootcamp models
const Bootcamp = require("../models/Bootcamp");
//requiring our asyncHandler
const asyncHandler = require("../middleware/async");
//Requiring Geocode
const geoCoder = require("../utils/geocoder");
//requiring path module
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");

//@route  GET /api/v1/bootcamps
//@desc   GET All bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  return res.status(200).json(res.advancedResults);
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
  //Add user to Bootcamp Schema from req.body
  req.body.user = req.user.id;
  //Check for published bootcamp so only one can be created and not duplicated
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
  //If user is not admin only one bootcamp be added
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with id: ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }
  //creating a new Bootcamp and passing the request.body as the data to save to the DB
  const bootcamp = await Bootcamp.create(req.body);
  //sending back a successful resource to the console and the data in JSON format to be accessed by the front-end
  return res.status(201).json({ success: true, data: bootcamp });
});

//@route  DELETE /api/v1/bootcamps/:id
//@desc   Delete a Bootcamp
//@access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const deletedBootcamp = await Bootcamp.findById(req.params.id);
  if (!deletedBootcamp) {
    return next(error);
  }
  //Check if Bootcamp owner is true
  if (
    deletedBootcamp.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this Bootcamp`,
        401
      )
    );
  }
  //calling the middleware to remove courses from the bootcamp where it matches its respective ID - SEE BOOTCAMP SCHEMA CASCADING
  deletedBootcamp.remove();
  return res.status(200).json({ success: true, data: {} });
});

//@route  PUT /api/v1/bootcamps/:id
//@desc   Update a Bootcamp
//@access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  //passing the arguments [id, newdata] = [id to find by, newdata entered] through the req.params/id and req.body, sequentially
  let updatedBootcamp = await Bootcamp.findById(req.params.id);
  //check if return data is true
  if (!updatedBootcamp) {
    return next(error);
  }
  //Ensure user is the bootcamp creator to edit
  if (
    updatedBootcamp.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this Bootcamp`,
        401
      )
    );
  }
  updatedBootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  return res.status(200).json({ success: true, data: updatedBootcamp });
});

//@route  GET /api/v1/bootcamps/radius/:zipcode/:distance
//@desc   Bootcamps within a radius
//@access Private
exports.radiusBootcamp = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get Latitude/Longitude from the GeoCoder
  const loc = await geoCoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //Calculating the raidus using radians = distance/radius of earth ::: earth radius=3963mi
  const radius = distance / 3963;

  const bootcampLocation = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  //if no bootcamps returned new ErrorResponse message sent back
  if (bootcampLocation.length === 0) {
    const message =
      "No Bootcamps within your search radius. Please expand the search criteria";
    return next(new ErrorResponse(message, 400));
  }

  return res.status(200).json({
    success: true,
    count: bootcampLocation.length,
    data: bootcampLocation
  });
});

//@route  PUT /api/v1/bootcamps/:id/photo
//@desc   Upload photo for bootcamp
//@access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcampPhoto = await Bootcamp.findById(req.params.id);
  if (!bootcampPhoto) {
    return next(error);
  }

  //Check if Bootcamp owner is true
  if (
    bootcampPhoto.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this Bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(error);
  }

  const file = req.files.file;

  // Check if file is photo using startswith method = all images are prefixed with image/(png or jpg or svg)
  if (!file.mimetype.startsWith("image")) {
    return next(error);
  }

  //Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(error);
  }

  //Create custom file name to avoid duplicates/overwrites
  file.name = `photo_${bootcampPhoto._id}${path.parse(file.name).ext}`;

  // Upload the file to the DB
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async error => {
    if (error) {
      console.error(error);
      return next(error);
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});
