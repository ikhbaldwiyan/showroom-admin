const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  translatedTitle: {
    type: String,
    required: true,
  },
});

const setlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  songs: {
    type: [songSchema], // Now it's an array of objects (songs)
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
}, {
  collection: "setlists", // Specify the desired collection name
});

const Setlist = mongoose.model('Setlist', setlistSchema);

module.exports = Setlist;
