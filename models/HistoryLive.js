const mongoose = require("mongoose");

const liveSchema = new mongoose.Schema(
  {
    roomId: Number,
    name: String,
    live_id: Number,
    date: String,
  },
  {
    collection: "live_ids", // Specify the desired collection name
  }
);

module.exports = mongoose.model("Live", liveSchema);
