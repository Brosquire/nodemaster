//Controller File for express routes middleware

//bringing in our bootcamp models
const Bootcamp = require("../models/Bootcamp");
//requiring our errorResponse class to be passed for error handling
const ErrorResponse = require("../utils/errorResponse");

//@route  GET /api/v1/bootcamps
//@desc   GET All bootcamps
//@access Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();
    return res
      .status(200)
      .json({ success: true, count: bootcamps.length, data: bootcamps });
  } catch (error) {
    /* 
      using next for error handling 
      (argument is our new CLASS we created in utils being passed
      the message and statusCode of the error)
    */
    next(new ErrorResponse(`Bootcamps Not Found... please try again`, 404));
  }
};

//@route  GET /api/v1/bootcamps/:id
//@desc   GET single bootcamp
//@access Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    //checking to see if bootcamp returns true
    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp NOT found with id of: ${req.params.id}`,
          404
        )
      );
    }

    return res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    /* 
      using next for error handling 
      (argument is our new CLASS we created in utils being passed
      the message and statusCode of the error)
    */
    next(
      new ErrorResponse(`Bootcamp NOT found with id of: ${req.params.id}`, 404)
    );
  }
};

//@route  POST /api/v1/bootcamps
//@desc   Create a new Bootcamp
//@access Private
exports.createBootcamp = async (req, res, next) => {
  try {
    //creating a new Bootcamp and passing the request.body as the data to save to the DB
    const bootcamp = await Bootcamp.create(req.body);
    //sending back a successful resource to the console and the data in JSON format to be accessed by the front-end
    return res.status(201).json({ success: true, data: bootcamp });
  } catch (error) {
    return next(
      new ErrorResponse(`Upload not complete... please try again`, 400)
    );
  }
};

//@route  DELETE /api/v1/bootcamps/:id
//@desc   Delete a Bootcamp
//@access Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const deletedBootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!deletedBootcamp) {
      return next(
        new ErrorResponse(`Invalid Id entry of: ${req.params.id}`, 404)
      );
    }

    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(new ErrorResponse(`Invalid Id entry of: ${req.params.id}`, 404));
  }
};

//@route  PUT /api/v1/bootcamps/:id
//@desc   Update a Bootcamp
//@access Private
exports.updateBootcamp = async (req, res, next) => {
  try {
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
      return next(new ErrorResponse(`Update not complete... try again`, 400));
    }

    return res.status(200).json({ success: true, data: updatedBootcamp });
  } catch (error) {
    next(new ErrorResponse(`Update not complete... try again`, 400));
  }
};
