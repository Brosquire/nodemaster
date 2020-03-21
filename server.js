//requiring express
const express = require("express");
//requiring dotenv
const dotenv = require("dotenv");
//requiring middleware from our dependencies
const morgan = require("morgan");

//Routing files
const bootcamps = require("./routes/bootcamps");

//Loading environmental variables
dotenv.config({ path: "./config/config.env" });

//initializing our app to use express
const app = express();

//DEV logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Mount routers to our app
app.use("/api/v1/bootcamps", bootcamps);

//setting our port variable from our environment file in the config folder
const PORT = process.env.PORT || 5000;

//activating the server
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} node on port ${PORT} `
  );
});
