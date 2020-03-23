const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  //Copy req.query
  const reqQuery = { ...req.query };

  //Fields to exclude from query string
  const removeFields = ["select", "sort", "page", "limit"];

  //Loop over the removeFields array and delete respected fields from req.query
  removeFields.forEach(param => delete reqQuery[param]);

  //setting our query string to the reqQuery method and stringifying it
  let queryString = JSON.stringify(reqQuery);

  //regex to replace the mongoose methods(greater than, greater than equal to,
  // less than, less than equal to and in) to be replaced with a $ in front
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    match => `$${match}`
  );
  //finding resource
  query = model.find(JSON.parse(queryString));

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
  const limit = parseInt(req.query.limit, 10) || 25; //limit per page default = 25
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Populate
  if (populate) {
    query = query.populate(populate);
  }

  //executing our query
  const results = await query;

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

  //sending back the data in an advancedResults object to be used dynamically through all routes
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  //pasing next to move on to the next middleware
  next();
};

module.exports = advancedResults;
