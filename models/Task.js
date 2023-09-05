const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    criteria: {
      type: Number,
      required: true,
    },
    reward: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    }, // 'watch', 'comment', or other types
    active: {
      type: Boolean,
      default: true,
    },
    exp: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "tasks",
  }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
