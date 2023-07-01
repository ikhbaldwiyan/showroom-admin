const express = require('express');
const userRoute = require("./routes/userRoute")
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('image'));
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Server Running on http://localhost:8000');


    app.use('/users', userRoute);

    app.get('/', (req, res) => {
      res.redirect('/users')
    });


    // Start the server
    app.listen(8000, () => {
      console.log(`Server Running`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
