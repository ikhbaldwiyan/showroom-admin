const mongoose = require("mongoose");

const SharingLiveSchema = new mongoose.Schema(
  {
    created_at: {
      type: Date,
      default: Date.now
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schedule_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
    },
    discord_name: {
      type: String,
      required: true,
    },
    discord_image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    order_id: {
      type: String,
      required: true,
    },
    setlist_name: {
      type: String,
      required: true
    },
    user_name: {
      type: String,
      required: true
    },
    date_schedule: {
      type: Date,
      required: true
    },
  },
  {
    collection: "sharing-lives",
  }
);

const SharingLive = mongoose.model("SharingLive", SharingLiveSchema);

module.exports = SharingLive;
