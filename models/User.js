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
  avatar: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  experience: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  progressData: {
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
        liveIds: [String] 
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
  watchLiveIDN: {
    type: Number,
    default: 0
  },
  watchLiveOfficialJKTShowroom: {
    type: Number,
    default: 0
  },
  watchShowroomMember: {
    type: Number,
    default: 0
  },
  watchLiveMultiroom: {
    type: Number,
    default: 0
  },
  totalWatchLive: {
    type: Number,
    default: 0
  },    
}, {
  collection: 'users' // Specify the desired collection name
});

const User = mongoose.model('User', userSchema);

module.exports = User;
