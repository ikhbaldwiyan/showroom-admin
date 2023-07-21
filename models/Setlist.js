// models/setlistModel.js
const mongoose = require('mongoose');

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
    type: [String], // Now it's an array of strings (songs)
  },
  image: {
    type: String,
    required: true,
  },
},{
  collection: "setlists", // Specify the desired collection name
});

const Setlist = mongoose.model('Setlist', setlistSchema);

module.exports = Setlist;
