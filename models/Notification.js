const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    isReadAdmin: {
      type: Boolean,
      default: false, // Notification is unread by default
    },
    isReadUser: {
      type: Boolean,
      default: false, // Notification is unread by default
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    route: {
      type: String,
      required: false
    },
  },
  {
    collection: "notification", // Specify the desired collection name
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
