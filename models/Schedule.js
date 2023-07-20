const mongoose = require("mongoose");

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
    birthdayMemberName: {
      type: String,
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
    setlist: {
      type: String,
      required: true,
    },
    ticketShowroom: {
      type: String,
      required: true,
    },
    ticketTheater: {
      type: String,
      required: true,
    },
    memberList: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    }],
  },
  {
    collection: "theater-schedules", // Specify the desired collection name
  }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
