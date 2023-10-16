const SharingLive = require("../models/SharingLive");

exports.getAllSharingLive = async (req, res) => {
  try {
    const sharingLive = await SharingLive.find()
      .populate({
        path: "schedule_id",
        select: "showDate showTime setlist",
        populate: {
          path: "setlist",
          select: "name originalName",
        },
      })
      .populate({
        path: "user_id",
        select: "name user_id",
      });
    res.json(sharingLive);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createSharingLive = async (req, res) => {
  const { schedule_id, discord_name, status, user_id } = req.body;
  try {
    const newsharingLive = new SharingLive({
      user_id,
      schedule_id,
      discord_name,
      status,
    });
    const registeredUser = await SharingLive.findOne({
      user_id,
      schedule_id,
    });

    if (registeredUser) {
      return res
        .status(400)
        .json({ message: "User is already registered for this sharing live." });
    }

    await newsharingLive.save();
    res.status(201).json(newsharingLive);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSharingLiveDetail = async (req, res) => {
  try {
    const sharingLiveId = req.params.id;
    const sharingLive = await SharingLive.findById(sharingLiveId)
      .populate({
        path: "schedule_id",
        select: "showDate showTime setlist",
        populate: {
          path: "setlist",
          select: "name originalName",
        },
      })
      .populate({
        path: "user_id",
        select: "name user_id",
      });

    if (!sharingLive) {
      return res.status(404).json({ error: "Sharing live event not found" });
    }

    res.json(sharingLive);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateSharingLive = async (req, res) => {
  const sharingLiveId = req.params.id;
  const { schedule_id, discord_name, status, user_id } = req.body;

  try {
    const sharingLive = await SharingLive.findByIdAndUpdate(
      sharingLiveId,
      { schedule_id, discord_name, status, user_id },
      { new: true }
    )
      .populate({
        path: "schedule_id",
        select: "showDate showTime setlist",
        populate: {
          path: "setlist",
          select: "name originalName",
        },
      })
      .populate({
        path: "user_id",
        select: "name user_id",
      });

    if (!sharingLive) {
      return res.status(404).json({ error: "Sharing live event not found" });
    }

    res.json(sharingLive);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteSharingLive = async (req, res) => {
  const sharingLiveId = req.params.id;

  try {
    const deletedSharingLive = await SharingLive.findByIdAndDelete(
      sharingLiveId
    );

    if (!deletedSharingLive) {
      return res.status(404).json({ error: "Sharing live event not found" });
    }

    res.json({ message: "Sharing live users deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
