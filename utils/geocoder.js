//requiring our node geocoder
const NodeGeoCoder = require("node-geocoder");
//requiring dotenv
const dotenv = require("dotenv");
//Loading environmental variables
dotenv.config({ path: "./config/config.env" });

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

const geoCoder = NodeGeoCoder(options);

module.exports = geoCoder;
