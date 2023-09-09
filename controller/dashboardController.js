const moment = require("moment");
const Activity = require("../models/Activity");
const Task = require("../models/Task");
const User = require("../models/User");

async function countDocumentsByTime(model, timestamp, timePeriod) {
  try {
    let filter = {};

    // Define the date range based on the time period
    switch (timePeriod) {
      case "today":
        filter = {
          [timestamp]: {
            $gte: moment().startOf("day").toDate(),
            $lt: moment().endOf("day").toDate(),
          },
        };
        break;
      case "week":
        filter = {
          [timestamp]: {
            $gte: moment().startOf("week").toDate(),
            $lt: moment().endOf("week").toDate(),
          },
        };
        break;
      case "month":
        filter = {
          [timestamp]: {
            $gte: moment().startOf("month").toDate(),
            $lt: moment().endOf("month").toDate(),
          },
        };
        break;
      case "all":
        // No date filter for "all" time
        break;
      default:
        throw new Error("Invalid time period");
    }

    const count = await model.countDocuments(filter);
    return count;
  } catch (error) {
    throw error;
  }
}

exports.dashboardAdmin = async (req, res) => {
  try {
    const totalUsers = await countDocumentsByTime(User, "createdAt", "all");
    
    const totalActivityToday = await countDocumentsByTime(
      Activity,
      "timestamp",
      "today"
    );
    const totalActivityWeek = await countDocumentsByTime(
      Activity,
      "timestamp",
      "week"
    );
    const totalActivityMonth = await countDocumentsByTime(
      Activity,
      "timestamp",
      "month"
    );
    const totalActivityAll = await countDocumentsByTime(
      Activity,
      "timestamp",
      "all"
    );
    const totalTask = await Task.find({
      active: true,
    }).countDocuments();

    res.status(200).json({
      totalUsers,
      totalActivity: {
        today: totalActivityToday,
        week: totalActivityWeek,
        month: totalActivityMonth,
        all: totalActivityAll,
      },
      totalTask,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data." });
  }
};
