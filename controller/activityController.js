const Activity = require("../models/Activity");
const User = require("../models/User"); // Assuming you have a User model
const { responseSuccess } = require("../utils/response");

// Controller to create a new activity log
exports.createActivity = async (req, res) => {
  try {
    const { log_name, description, user_id, live_id, device } = req.body;

    // Check if user_id exists
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const checkType = ["Watch", "Comment", "Premium Live"];

    if (checkType.includes(log_name)) {
      const existingActivity = await Activity.findOne({
        log_name,
        description,
        user: user_id,
        live_id,
      });

      if (existingActivity) {
        return res.status(409).json({ error: "Duplicate activity log" });
      }
    }

    const newActivity = new Activity({
      log_name,
      description,
      user: user_id,
      live_id,
      device,
    });

    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

// Controller to get all activity logs
exports.getAllActivities = async (req, res) => {
  try {
    // Extract the log_name from the request query
    const { type, limit, page } = req.query;

    const limitData = limit ?? 10;
    const pageData = page ?? 1;

    const totalData = await Activity.countDocuments({});
    const totalPage = Math.ceil(totalData / limitData);

    // Create a filter object to conditionally filter by log_name
    const filter = {};
    if (type) {
      filter.log_name = type;
    }

    // Query the activities based on the optional log_name filter
    const activities = await Activity.find(filter)
      .populate({
        path: "user",
        select: "_id name user_id avatar",
      })
      .populate("task")
      .sort("-timestamp")
      .skip((pageData - 1) * limitData)
      .limit(limitData)
      .exec();

    let result = {
      lists: activities,
      paginator: {
        currentPage: parseInt(pageData),
        limit: parseInt(limitData),
        totalPage,
        totalData,
      },
    };

    let response = responseSuccess(200, "Success", result);

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.getActivityById = async (req, res) => {
  try {
    const activityId = req.params.id;

    const activity = await Activity.findById(activityId)
      .populate("user")
      .populate("task");
    if (!activity) {
      return res.status(404).json({ error: "Activity log not found" });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.deleteActivityById = async (req, res) => {
  try {
    const activityId = req.params.id;

    // Check if the activity log exists
    const activity = await Activity.findByIdAndRemove(activityId);
    if (!activity) {
      return res.status(404).json({ error: "Activity log not found" });
    }

    res.json({ message: "Activity log deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.getActivityUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const activity = await Activity.find({
      user: userId,
    }).sort("-timestamp");

    const user = await User.findById(userId).select("user_id avatar name");

    if (!activity) {
      return res.status(404).json({ error: "Activity log not found" });
    }

    res.json({
      detail: {
        ...user._doc,
        totalActivity: activity.length,
      },
      data: activity,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};
