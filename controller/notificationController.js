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
    ? `${DISCORD_API}/search?query=${req.query.name}&limit=20`
    : `${DISCORD_API}?limit=30`;

  try {
    axios
      .get(API, {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      })
      .then((response) => {
        res.status(200).send(
          response.data.sort((a, b) => {
            const joinedAtA = new Date(a.joined_at);
            const joinedAtB = new Date(b.joined_at);

            // Compare join dates (newest first)
            return joinedAtB - joinedAtA;
          })
        );
      });
  } catch (err) {
    console.log(err);
  }
};

exports.sendDiscordSharingUser = (req, res) => {
  const { name, setlist, orderId } = req.body;

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
          const message = `${username} berhasil register sharing live **${setlist}** dengan order id **#${orderId}** silahkan kontak <@&1104077539040825365> untuk info lebih lanjut`;

          axios
            .post(
              "https://jkt48-showroom-bot.ikhbaldwiyan.repl.co/discord/message-bot",
              {
                type: "sharing",
                messageType: "chat",
                message: message,
              }
            )
            .then((res) => {
              console.log(res.data);
            })
            .catch((err) => {
              console.log(err);
            });

          res.json({
            user: discordUser,
            message: notif,
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
