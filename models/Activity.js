const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  log_name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
},{
  collection: "activities-log", // Specify the desired collection name
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
