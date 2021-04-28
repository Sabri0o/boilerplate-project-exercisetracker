const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

//The express.json() and express.urlencoded() middleware have been added to provide request body parsing support out-of-the-box.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// connecting database
const mySecret = process.env["MONGO_URI"];

let mongoose;
try {
  mongoose = require("mongoose");
} catch (error) {
  console.log(error);
}
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  function (error) {
    if (error) {
      console.log("Database error or database connection error " + error);
    }
    console.log("Database state is " + !!mongoose.connection.readyState);
  }
);

// importing UserTracker modal
const UserTracker = require("./dbSchema.js").UserTrackerModel;

// **************** create a new user ***************

// check if the username exists in db middleware
const checkUserName = function (req, res, next) {
  let userName = req.body.username;
  UserTracker.findOne({ username: userName }).then((record) => {
    if (record) {
      res.send("Username already taken");
    } else {
      console.log("proceeding registration...");
      next();
    }
  });
};

// create a new user
app.post("/api/users", checkUserName, function (req, res) {
  let userName = req.body.username;
  var newUser = new UserTracker({
    username: userName,
  });
  newUser.save(function (err, record) {
    if (err) {
      console.log(err);
    } else {
      console.log("new user is saved successfully");
      res.json({ username: record.username, _id: record._id });
    }
  });
});

// ***************** get an array of all users ****************
app.get("/api/users", function (req, res) {
  console.log("*********************");
  var query = UserTracker.find();
  query
    .select(["_id", "username"])
    .then((records) => {
      // console.log(records)
      res.send(records);
    })
    .catch((err) => res.send(err.message));
});

// ************* add exercise to an existed user **********
// importing UserTracker modal
const ExerciseTracker = require("./dbSchema.js").ExerciseTrackerModel;

app.post("/api/users/:_id/exercises", function (req, res) {
  // console.log(req.body)
  let userId = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date =
    new Date(req.body.date).toDateString() === "Invalid Date"
      ? new Date().toDateString()
      : new Date(req.body.date).toDateString();
  let userExercise = {
    description: description,
    duration: duration,
    date: date,
  };

  UserTracker.findOne({ _id: userId })
    .then((user) => {
      var addExercise = ExerciseTracker.create(userExercise)
        .then((exercise) => {
          // console.log('exercise:',exercise)
          // console.log('user:',user)
          user.count += 1;
          user.log.push(userExercise);
          user.save(function (err, data) {
            if (err) {
              console.log(err.message);
            }
            console.log("exercise added successfully");
            res.json({
              _id: user._id,
              username: user.username,
              description: description,
              duration: Number(duration),
              date: date,
            });
          });
        })
        .catch((err) => {
          console.log(err.message);
          res.send(err.message);
        });
    })
    .catch((err) => {
      console.log(err.message);
      res.send(err.message);
    });
});

// ************* get a full exercise log of any user **********

// check from, to and limit validity middleware
const checkQuery = function (req, res, next) {
  req.from =
    new Date(req.query.from).toDateString() === "Invalid Date"
      ? true
      : new Date(req.query.from);
  req.to =
    new Date(req.query.to).toDateString() === "Invalid Date"
      ? false
      : new Date(req.query.to);
  req.limit = Number.isInteger(Number(req.query.limit))
    ? Number(req.query.limit)
    : undefined;
  next();
};

app.get("/api/users/:_id/logs?", checkQuery, function (req, res) {
  var thatUser = req.params._id;
  console.log("limit: ", req.limit);
  UserTracker.findOne({ _id: thatUser })
    .then((record) => {
      var userQuery = { _id: record._id, username: record.username };
      var userLogs = record.log
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .filter(
          (a) =>
            new Date(a.date) >= req.from &&
            (!req.to ? true : new Date(a.date) <= req.to)
        )
        .slice(0, req.limit);
      userQuery.count = userLogs.length;
      if (req.from instanceof Date) {
        userQuery.from = req.from.toDateString();
      }
      if (req.to instanceof Date) {
        userQuery.to = req.to.toDateString();
      }
      userQuery.log = userLogs;
      res.json(userQuery);
    })
    .catch((err) => {
      res.send(err.message);
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
