const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



// connecting database
const mySecret = process.env['MONGO_URI']

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
    useFindAndModify: false 
  },
  function (error) {
    if (error) {
      console.log("Database error or database connection error " + error);
    }
    console.log("Database state is " + !!mongoose.connection.readyState);
  }
);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
