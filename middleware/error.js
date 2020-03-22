//error handler function for Middleware

//requiring our ErrorResponse Class
const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  //setting error = all errors
  let error = { ...err };

  //setting the error.message to the spread of errors from the variable
  error.message = err.message;
  //console log for DEV
  console.log(err.stack);

  //Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Bootcamp NOT found with id of: ${error.value}`;
    error = new ErrorResponse(message, 404);
  }

  //Mongoose Duplicate Key
  if (err.code === 11000) {
    const message = "Duplicate Entry";
    error = new ErrorResponse(message, 400);
  }

  //Mongoose validation error
  if (err.name === "ValidationError") {
    //picking off the errors array using ObjectValues and mapping over the message values of the errors array
    //this is used to get the text from our model with its required paramters and error messages we entered into the model
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, msg: error.message || "Server Error" });
};

module.exports = errorHandler;

//Log the error object itself to run conditionals for improved error handling
//console.log(error)
