const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stage_name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: "regular"
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    collection: "members", // Specify the desired collection name
  }
);

module.exports = mongoose.model("Member", memberSchema);
