const Activity = require("../models/Activity");
const HistoryLive = require("../models/HistoryLive");

exports.getAllLiveHistory = async (req, res) => {
  try {
    const liveHistory = await HistoryLive.find({});
    res.json(liveHistory);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to get details of a specific live event by _id
exports.getLiveDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const liveData = await HistoryLive.findOne({ live_id: parseInt(id) });
    const activityLog = await Activity.find({ live_id: parseInt(id) }).populate("user");

    if (!liveData) {
      return res.status(404).json({ message: "Live not found" });
    }

    res.json({ liveData, activityLog });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to get details of live events by array of _ids
exports.getLiveDetailsByIds = async (req, res) => {
  const { ids } = req.body;

  try {
    const liveData = await HistoryLive.find({ live_id: { $in: ids } });

    if (!liveData || liveData.length === 0) {
      return res.status(404).json({ message: "Live not found" });
    }

    res.json(liveData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
