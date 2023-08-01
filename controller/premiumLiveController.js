const PremiumLive = require("../models/PremiumLive");

const premiumLiveController = {
  getAllPremiumLives: async (req, res) => {
    try {
      const premiumLives = await PremiumLive.find()
        .populate("setlist")
        .populate("theaterShow");
      res.json(premiumLives);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
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
      const premiumLive = await PremiumLive.findById(req.params.id).populate("setlist")
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
};

module.exports = premiumLiveController;
