const { default: axios } = require("axios");
const Notification = require("../models/Notification");
const DISCORD_API =
  "https://discord.com/api/v10/guilds/1076511743909564506/members";

exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    const notification = new Notification({ userId, message, type });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getNotificationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    // Mark notifications as read
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllNotificationsForAdmin = async (req, res) => {
  try {
    // Fetch all notifications
    const notifications = await Notification.find()
      .populate({
        path: "userId",
        select: "name user_id",
      })
      .sort({ createdAt: -1 });

    res.status(200).send(notifications);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.checkDiscordAccount = (req, res) => {
  const API = req.query.name
    ? `${DISCORD_API}/search?query=${req.query.name}&limit=30`
    : `${DISCORD_API}?limit=60`;

  try {
    axios
      .get(API, {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      })
      .then((response) => {
        res.status(200).send(response.data.filter((item) => !item.user.bot));
      });
  } catch (err) {
    console.log(err);
  }
};

exports.sendDiscordSharingUser = (req, res) => {
  const { name, setlist, orderId, type, sharingId } = req.body;
  let message = "";
  let api = "https://jkt48-showroom-bot.ikhbaldwiyan.repl.co/discord/message-bot";

  try {
    axios
      .get(`${DISCORD_API}/search?query=${name}`, {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      })
      .then((response) => {
        const discordUser = response.data[0];

        if (discordUser) {
          const userId = discordUser.user.id;
          const username = `<@${userId}>`;

          /// SEND NOTIF TO DISCORD SERVER
          if (type === "register") {
            api = "https://jkt48-showroom-bot.ikhbaldwiyan.repl.co/discord/sharing-live"
            message = `Berhasil Register sharing live dengan order id **#${orderId}**`;
          } else if (type === "success") {
            message = `${username} pembayaran sharing live **${setlist}** dengan order id **#${orderId}** berhasil`;
          }

          axios
            .post(api, {
              type: "sharing",
              messageType: "chat",
              message,
              sharingId,
              discordName: username,
            })
            .then((res) => {
              console.log(res.data);
            })
            .catch((err) => {
              console.log(err);
            });

          res.json({
            user: discordUser,
            message,
          });
        } else {
          res.send({ message: "User not found on Discord server" });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};
