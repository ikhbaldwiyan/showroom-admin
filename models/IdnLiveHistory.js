const mongoose = require("mongoose");

const IDNliveSchema = new mongoose.Schema(
  {
    room_id: String,
    name: String,
    live_id: String,
    date: String,
    image: String,
    username: String
  },
  {
    collection: "idn_lives_history", // Specify the desired collection name
  }
);

module.exports = mongoose.model("idn_lives_history", IDNliveSchema);
