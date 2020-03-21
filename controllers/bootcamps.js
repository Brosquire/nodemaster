//Controller File for express routes middleware

//@route  GET /api/v1/bootcamps
//@desc   GET All bootcamps
//@access Public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: "Show all bootcamps" });
};

//@route  GET /api/v1/bootcamps/:id
//@desc   GET single bootcamp
//@access Public
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Show bootcamp #${req.params.id}`
  });
};

//@route  POST /api/v1/bootcamps
//@desc   Create a new Bootcamp
//@access Private
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: "Created a Bootcamp" });
};

//@route  DELETE /api/v1/bootcamps/:id
//@desc   Delete a Bootcamp
//@access Private
exports.deleteBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete Bootcamp #${req.params.id}` });
};

//@route  PUT /api/v1/bootcamps/:id
//@desc   Update a Bootcamp
//@access Private
exports.updateBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ sucess: true, msg: `Updated Bootcamp #${req.params.id}` });
};
