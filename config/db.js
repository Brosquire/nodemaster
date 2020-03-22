//requiring our mongoose dependency
const mongoose = require("mongoose");

//connection function to ouyr DB
const connectDB = async () => {
  const connect = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });

  console.log(`MongoDB Connected ${connect.connection.host}`);
};

module.exports = connectDB;
