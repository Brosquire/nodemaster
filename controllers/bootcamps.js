/* Controller File for express routes middleware */

//bringing in our bootcamp models
const Bootcamp = require("../models/Bootcamp");
//requiring our asyncHandler
const asyncHandler = require("../middleware/async");
//Requiring Geocode
const geoCoder = require("../utils/geocoder");
const ErrorResponse = require("../utils/errorResponse");

//@route  GET /api/v1/bootcamps
//@desc   GET All bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  //Copy req.query
  const reqQuery = { ...req.query };

  //Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  //Loop over the removeFields array and delete respected fields from req.query
  removeFields.forEach(param => delete reqQuery[param]);

  //setting our query string to the reqQuery method and stringifying it
  let queryString = JSON.stringify(reqQuery);

  //regex to replace the mongoose methods(greater tha, greater than equal to,
  // less than, less than equal to and in) to be replaced with a $ in front
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    match => `$${match}`
  );
  //finding resource
  query = Bootcamp.find(JSON.parse(queryString));

  //Select Fields
  if (req.query.select) {
    //splitting the query fields by a comma and joining them with a space
    //and setting that to our query field to be displayed in the console
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort(`-createdAt`);
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1; //page number with default 1
  const limit = parseInt(req.query.limit, 10) || 25; //limit per page default = 100
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //executing our query
  const bootcamps = await query;

  //Pagination result
  const pagination = {};
  //next page
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  //previous page
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  return res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps
  });
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
