const SharingLive = require("../models/SharingLive");

exports.getAllSharingLive = async (req, res) => {
  try {
    const { search } = req.query;
    const searchQuery = search || '';

    const query = {
      $or: [
        { "user_id.user_id": { $regex: searchQuery, $options: 'i' } }, 
        { "user_id.name": { $regex: searchQuery, $options: 'i' } },
        { "discord_name": { $regex: searchQuery, $options: 'i' } },
        { "order_id": { $regex: searchQuery, $options: 'i' } },
        { "schedule_id.setlist.name": { $regex: searchQuery, $options: 'i' } }, 
      ],
    };

    const sharingLives = await SharingLive.find(query)
      .populate({
        path: "schedule_id",
        select: "showDate showTime setlist",
        populate: {
          path: "setlist",
          select: "name originalName image",
        },
      })
      .populate({
        path: "user_id",
        select: "name user_id",
      });

    res.json(sharingLives);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.registerSharingLive = async (req, res) => {
  const { schedule_id, discord_name, status, user_id, image, phone_number, discord_image } = req.body;
  try {
    // Find the latest order ID from the database
    const latestOrder = await SharingLive.findOne().sort({ order_id: -1 });

    let orderNumber = 1;
    if (latestOrder) {
      // Extract the order number from the latest order ID and increment it
      const latestOrderNumber = parseInt(latestOrder?.order_id?.slice(2), 10);
      orderNumber = latestOrderNumber + 1;
    }

    // Format the order number with leading zeros and combine it with "SR"
    const order_id = `SR${orderNumber.toString().padStart(3, "0")}`;

    const newsharingLive = new SharingLive({
      user_id,
      schedule_id,
      discord_name,
      discord_image,
      status,
      image,
      phone_number,
      order_id,
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
          select: "name originalName image",
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
  const { schedule_id, discord_name, status, user_id, image, phone_number } =
    req.body;

  try {
    const sharingLive = await SharingLive.findByIdAndUpdate(
      sharingLiveId,
      { schedule_id, discord_name, status, user_id, image, phone_number },
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

exports.getSharingLiveUsers = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const sharingLive = await SharingLive.find({ schedule_id: scheduleId });

    if (!sharingLive) {
      return res.status(404).json({ error: "Sharing live event not found" });
    }

    res.json(sharingLive);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getHistorySharingLive = async (req, res) => {
  try {
    const userId = req.params.userId;
    const sharingLive = await SharingLive.find({ user_id: userId })
      .populate({
        path: "schedule_id",
        select: "showDate showTime setlist",
        populate: {
          path: "setlist",
          select: "name originalName image",
        },
      })

    if (!sharingLive || sharingLive.length === 0) {
      return res.status(404).json({ error: "No sharing live events found for this user" });
    }

    res.json(sharingLive);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
