//requiring express
const express = require("express");
//requiring dotenv
const dotenv = require("dotenv");

//Routing files
const bootcamps = require("./routes/bootcamps");

//Loading environmental variables
dotenv.config({ path: "./config/config.env" });

//initializing our app to use express
const app = express();

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
