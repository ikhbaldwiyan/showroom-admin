const moment = require("moment");
const PremiumLive = require("../models/PremiumLive");
const SharingLive = require("../models/SharingLive");

const premiumLiveController = {
  getAllPremiumLives: async (req, res) => {
    const premiumLives = await PremiumLive.find()
      .populate("setlist")
      .populate("theaterShow");

    const scheduleIds = premiumLives.map(
      (premiumLive) => premiumLive.theaterShow
    );

    const sharingLiveUsersPromises = scheduleIds.map(async (scheduleId) => {
      const sharingLiveUsers = await SharingLive.find({
        schedule_id: scheduleId,
      }).populate({
        path: "user_id",
        select: "name user_id",
      });
      return { scheduleId, sharingLiveUsers };
    });

    const combinedData = await Promise.all(sharingLiveUsersPromises);

    // Combine sharingLiveUsers with premiumLives based on scheduleId
    const premiumLivesWithSharingUsers = premiumLives.map((premiumLive) => {
      const matchingData = combinedData.find(
        (data) =>
          data?.scheduleId?.toString() === premiumLive?.theaterShow?.toString()
      );
      return {
        ...premiumLive._doc,
        sharingLiveUsers: matchingData ? matchingData.sharingLiveUsers : [],
      };
    });

    res.json(premiumLivesWithSharingUsers);
  },

  createPremiumLive: async (req, res) => {
    try {
      const { liveDate, webSocketId, setlist, theaterShow } = req.body;
      const premiumLive = await PremiumLive.create({
        liveDate,
        webSocketId,
        setlist,
        theaterShow,
      });
      res.json(premiumLive);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getPremiumLiveById: async (req, res) => {
    try {
      const premiumLive = await PremiumLive.findById(req.params.id)
        .populate("setlist")
        .populate("theaterShow");
      if (!premiumLive) {
        res.status(404).json({ error: "Premium live not found" });
        return;
      }
      res.json(premiumLive);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updatePremiumLive: async (req, res) => {
    try {
      const { liveDate, webSocketId, setlist, theaterShow } = req.body;
      const premiumLive = await PremiumLive.findByIdAndUpdate(
        req.params.id,
        { liveDate, webSocketId, setlist, theaterShow },
        { new: true }
      );
      if (!premiumLive) {
        res.status(404).json({ error: "Premium live not found" });
        return;
      }
      res.json(premiumLive);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deletePremiumLive: async (req, res) => {
    try {
      const premiumLive = await PremiumLive.findByIdAndDelete(req.params.id);
      if (!premiumLive) {
        res.status(404).json({ error: "Premium live not found" });
        return;
      }
      res.json({ message: "Premium live deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getTodayPremiumLive: async (req, res) => {
    const todayDate = moment().format("YYYY-MM-DD");
    const premiumLives = await PremiumLive.find({
      liveDate: todayDate,
    }).populate("setlist");

    const scheduleIds = premiumLives.map(
      (premiumLive) => premiumLive.theaterShow
    );

    const sharingLiveUsersPromises = scheduleIds.map(async (scheduleId) => {
      const sharingLiveUsers = await SharingLive.find({
        schedule_id: scheduleId,
      }).populate({
        path: "user_id",
        select: "name user_id",
      });
      return { scheduleId, sharingLiveUsers };
    });

    const combinedData = await Promise.all(sharingLiveUsersPromises);

    // Combine sharingLiveUsers with premiumLives based on scheduleId
    const premiumLivesWithSharingUsers = premiumLives.map((premiumLive) => {
      const matchingData = combinedData.find(
        (data) =>
          data?.scheduleId?.toString() === premiumLive?.theaterShow?.toString()
      );
      return {
        ...premiumLive._doc,
        sharingLiveUsers: matchingData ? matchingData.sharingLiveUsers : [],
      };
    });

    res.json(premiumLivesWithSharingUsers[0]);
  },
};

module.exports = premiumLiveController;
