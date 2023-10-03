const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
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
  },
  image: {
    type: String,
    required: true,
  },
  __v: {
    type: Number,
    select: false,
  },
});

const scheduleSchema = new mongoose.Schema(
  {
    showDate: {
      type: Date,
      required: true,
    },
    showTime: {
      type: String,
      required: true,
    },
    isBirthdayShow: {
      type: Boolean,
      default: false,
    },
    birthdayMember: {
      type: memberSchema,
      required: function () {
        return this.isBirthdayShow;
      },
      default: null,
    },
    isOnWeekSchedule: {
      type: Boolean,
      required: true,
      default: true,
    },
    isComingSoon: {
      type: Boolean,
      required: false,
      default: false,
    },
    isGraduationShow: {
      type: Boolean,
      required: false,
      default: false,
    },
    graduateMember: {
      type: memberSchema,
      required: function () {
        return this.isGraduationShow;
      },
      default: null,
    },
    setlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Setlist',
    },
    ticketShowroom: {
      type: String,
      required: false,
    },
    ticketTheater: {
      type: String,
      required: false,
      default: "https://jkt48.com/theater/schedule"
    },
    memberList: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    }],
    webImage: {
      type: String, 
      required: false,
    },
    bulkMemberInput: [{
      type: memberSchema,
      required: false,
    }],
  },
  {
    collection: "theater-schedules",
  }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
