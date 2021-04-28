const mongoose = require("mongoose")
let ExerciseTracker;
let UserTracker;


// creating user log nested schema
const exerciseSchema = new mongoose.Schema({
description:{type:String,required:true},
duration: {type:Number,required:true},
date: {type:String}
});

// creating a user schema
const  userSchema = new mongoose.Schema({
  username: {type:String,required:true},
  count: {
     type: Number,
     default: 0
  },
   log: {
     type: Array,
  }
});


// ceating a model
UserTracker = mongoose.model("UserTracker",userSchema)
ExerciseTracker = mongoose.model("ExerciseTracker", exerciseSchema);

exports.UserTrackerModel = UserTracker;
exports.ExerciseTrackerModel = ExerciseTracker;
