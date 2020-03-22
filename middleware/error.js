//error handler function for Middleware
const errorHandler = (error, req, res, next) => {
  //console log for DEV
  console.log(error.stack);

  res
    .status(error.statusCode || 500)
    .json({ success: false, msg: error.message || "Server Error" });
};

module.exports = errorHandler;
