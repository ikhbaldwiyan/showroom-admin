const Activity = require("../models/Activity");
const User = require("../models/User"); // Assuming you have a User model

// Controller to create a new activity log
exports.createActivity = async (req, res) => {
  try {
    const { log_name, description, user_id, live_id } = req.body;

    // Check if user_id exists
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if a similar activity already exists for "watch" or "comment" logs
    if (log_name === 'Watch' || log_name === 'Comment') {
      const existingActivity = await Activity.findOne({
        log_name,
        description,
        user: user_id,
        live_id,
      });

      if (existingActivity) {
        return res.status(409).json({ error: 'Duplicate activity log' });
      }
    }

    const newActivity = new Activity({
      log_name,
      description,
      user: user_id,
      live_id,
    });

    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Controller to get all activity logs
exports.getAllActivities = async (req, res) => {
  try {
    // Extract the log_name from the request query
    const { type } = req.query;

    // Create a filter object to conditionally filter by log_name
    const filter = {};
    if (type) {
      filter.log_name = type;
    }

    // Query the activities based on the optional log_name filter
    const activities = await Activity.find(filter)
      .populate("user")
      .populate("task")
      .sort("-timestamp");

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.getActivityById = async (req, res) => {
  try {
    const activityId = req.params.id;

    const activity = await Activity.findById(activityId).populate("user").populate("task");
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
      return res.status(404).json({ error: 'Activity log not found' });
    }

    res.json({ message: 'Activity log deleted successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'An error occurred' });
  }
};