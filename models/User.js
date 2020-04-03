const mongoose = require("mongoose");
//requiring bcrypt
const bcrypt = require("bcryptjs");
//requiring json webtoken
const jwt = require("jsonwebtoken");
//requiring core module to hash password token
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a Name"]
  },
  email: {
    type: String,
    required: [true, "Please enter an Email"],
    unique: true,
    //reg-ex for an email
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email"
    ]
  },
  role: {
    type: String,
    enum: ["user", "publisher"],
    default: "user"
  },
  password: {
    type: String,
    required: [true, "Please enter a passowrd"],
    minlength: 6,
    select: false //not going to show the password
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt Password using bcrypt
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign and Return JSONwbtoken(jwt)
UserSchema.methods.getSignedJwt = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Verify hashed password is === entered password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString("hex"); //passing 20 as the number of bytes and converting it to a string

  //Hash Token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //Set the expiration of the reset password token
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; //Expires in 10 minutes

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
