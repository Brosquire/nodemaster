const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for the review"],
    maxLength: 100
  },
  text: {
    type: String,
    required: [true, "Please add some text"]
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating between 1 - 10"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  }
});

//Add an index so that only ONE user can have ONE review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get average of rating
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
  //Aggregation
  const obj = await this.aggregate([
    //building the pipeline ie the steps in order to get to our finished resu;t = avg tuition
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: `$bootcamp`, //REMEMBER THE SYNTAX with $
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  try {
    //Calculating the average rating and setting into the bootcamp model
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating
    });
  } catch (error) {
    console.error(error);
  }
};

// Call getAverageCost after save
ReviewSchema.post("save", function() {
  this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageCost before remove
ReviewSchema.pre("remove", function() {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
