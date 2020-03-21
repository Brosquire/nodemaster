//requiring express
const express = require("express");
//requiring dotenv
const dotenv = require("dotenv");

//Loading environmental variables
dotenv.config({ path: "./config/config.env" });

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} node on port ${PORT} `
  );
});
