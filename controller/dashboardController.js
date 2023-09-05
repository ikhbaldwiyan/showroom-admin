const Activity = require("../models/Activity");
const Schedule = require("../models/Schedule");
const Task = require("../models/Task");
const User = require("../models/User");

exports.dashboardAdmin = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalActivity = await Activity.countDocuments();
    const totalTheaterSchedule = await Schedule.find({
      isOnWeekSchedule: true,
    }).countDocuments();
    const totalTask = await Task.find({
      active: true,
    }).countDocuments()

    res.status(200).json({
      totalUsers,
      totalActivity,
      totalTheaterSchedule,
      totalTask,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete admin user." });
  }
};