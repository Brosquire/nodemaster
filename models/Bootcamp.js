const mongoose = require("mongoose");
//requiring our slugify dependency
const slugify = require("slugify");
//requiring our geocoder function
const geoCoder = require("../utils/geocoder");

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter a name"],
      //no two entrie can be identical
      unique: true,
      //clear the whitespace from entered field
      trim: true,
      maxLength: [50, "Name can NOT be more than 50 characters"]
    },
    //shorthand for only one parameter (TYPE) being passed
    slug: String,
    description: {
      type: String,
      required: [true, "Please enter a description"],
      maxLength: [500, "Description can NOT be more than 500 characters"]
    },
    website: {
      type: String,
      //reg-ex for an HTTP or HTTPS website
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL with HTTP or HTTPS"
      ]
    },
    phone: {
      type: String,
      maxLength: [20, "Phone Number can NOT be longer than 20 characters"]
    },
    email: {
      type: String,
      //reg-ex for an email
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email"
      ]
    },
    address: {
      type: String,
      required: [true, "Please add an address"]
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: {
        type: [Number],
        index: "2dsphere"
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    careers: {
      //Array of strings
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other"
      ]
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating can NOT be more than 10"]
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg"
    },
    housing: {
      type: Boolean,
      default: false
    },
    jobAssistance: {
      type: Boolean,
      default: false
    },
    jobGuarantee: {
      type: Boolean,
      default: false
    },
    acceptGi: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true
    }
  },
  //Virtuals SEE BELOW
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//Create Bootcamp Slug from the name running before the document saves
BootcampSchema.pre("save", function(next) {
  //setting our middleware to run and change the name value to all lower case
  //this middleware is helpful for SEO on the frontend for cleaner URL's
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Geocode and create location field
BootcampSchema.pre("save", async function(next) {
  const location = await geoCoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [location[0].longitude, location[0].latitude],
    formattedAddress: location[0].formattedAddress,
    street: location[0].streetName,
    city: location[0].city,
    state: location[0].stateCode,
    zipcode: location[0].zipcode,
    country: location[0].countryCode
  };

  //Stopping the address from being saved to the DB
  this.address = undefined;

  next();
});

//Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre("remove", async function(next) {
  //calling this.model passing the argument Course as the model and deleteMany where the bootcamp id is equal to the Courses that have been populated to it
  await this.model(`Course`).deleteMany({ bootcamp: this._id });
  next();
});

// Reverse populate with virtuals
BootcampSchema.virtual(`courses`, {
  //pass the virtual a name of choosing ie: courses
  ref: `Course`, //reference the model we will be using
  localField: `_id`, //grab it by the respective id
  foreignField: `bootcamp`, //the field of data to use from the Model chosen ie: CourseSchema.bootcamp
  justOne: false //return an array
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
