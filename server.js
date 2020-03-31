//requiring express
const express = require("express");
//requiring dotenv
const dotenv = require("dotenv");
//requiring middleware from our dependencies
const morgan = require("morgan");
//requiring fileupload for express
const fileUpload = require("express-fileupload");
//requiring cookie parser
const cookieParser = require("cookie-parser");
//requiring path module
const path = require("path");
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
const courses = require("./routes/courses");
const auth = require("./routes/auth");

//initializing our app to use express
const app = express();

//Body Parser
app.use(express.json());

//Cookie Parser
app.use(cookieParser());

//DEV logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//File upload Middleware
app.use(fileUpload());

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

/*
Mount routes to our app
passing our error handler function 
AFTER the route has been mounted to the app()
*/
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
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
