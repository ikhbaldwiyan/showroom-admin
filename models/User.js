const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  progressData: {
    level: {
      type: Number,
      default: 1,
    },
    taskProgress: [
      {
        taskId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Task',
        },
        progress: Number,
        status: {
          type: String,
          default: "inprogress"
        },
      },
    ],
    completedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
  },
  can_3_room: {
    type: Boolean,
    default: false,
  },
  can_4_room: {
    type: Boolean,
    default: false,
  },
  can_farming_page: {
    type: Boolean,
    default: false,
  },
  can_farming_detail: {
    type: Boolean,
    default: false,
  },
  can_farming_multi: {
    type: Boolean,
    default: false,
  },
}, {
  collection: 'users' // Specify the desired collection name
});

const User = mongoose.model('User', userSchema);

module.exports = User;
