//requiring express
const express = require("express");
//requiring dotenv
const dotenv = require("dotenv");
//requiring middleware from our dependencies
const morgan = require("morgan");
//requiring our DB conenctive function
const connectDB = require("./config/db");
//requiring our errorHandler function to pass through our middleware
const errorHandler = require("./middleware/error");

//Loading environmental variables
dotenv.config({ path: "./config/config.env" });

//Connect to our DB
connectDB();

//Routing files
const bootcamps = require("./routes/bootcamps");

//initializing our app to use express
const app = express();

//Body Parser
app.use(express.json());

//DEV logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/*
Mount routes to our app
passing our error handler function 
AFTER the route has been mounted to the app()
*/
app.use("/api/v1/bootcamps", bootcamps);
app.use(errorHandler);

//setting our port variable from our environment file in the config folder
const PORT = process.env.PORT || 5000;

//activating the server
const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} node on port ${PORT} `)
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (error, promise) => {
  console.log(`Error: ${error.message}`);

  //Close server and exit process
  server.close(() => process.exit(1));
});
