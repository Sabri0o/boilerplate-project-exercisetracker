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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
