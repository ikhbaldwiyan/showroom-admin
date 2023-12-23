const Activity = require("../models/Activity");
const HistoryLive = require("../models/HistoryLive");
const fetchService = require("../utils/fetchService");

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
    
    const populateData = {
      path: "user",
      select: "name user_id avatar",
    };

    const watch = await Activity.find({
      live_id: parseInt(id),
      log_name: "Watch",
    }).populate(populateData);

    const comment = await Activity.find({
      live_id: parseInt(id),
      log_name: "Comment",
    }).populate(populateData);

    const profileUrl = `https://www.showroom-live.com/api/room/profile?room_id=${liveData?.roomId}`;
    const profileApi = await fetchService(profileUrl, res);

    // Destrurct response profile
    const profileData = (profile) => {
      return {
        room_name: profile.room_name,
        image: profile.image,
        views: profile.view_num,
        is_onlive: profile.is_onlive,
        current_live_started_at: profile.current_live_started_at,
      };
    };

    if (!liveData) {
      return res.status(404).json({ message: "Live not found" });
    }

    res.json({
      profile: profileData(profileApi.data),
      liveData: {
        ...liveData._doc,
        users: watch.length,
      },
      activityLog: {
        watch,
        comment,
      },
    });
  } catch (error) {
    console.log(error);
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
