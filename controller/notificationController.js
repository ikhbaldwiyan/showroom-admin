const { default: axios } = require("axios");
const Notification = require("../models/Notification");
const { DISCORD_API, BOT_API } = require("../utils/api");
const { responseSuccess, responseError } = require("../utils/response");

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
    const { limit, page } = req.query

    const limitData = limit ?? 10;
    const pageData = page ?? 1;

    const totalData = await Notification.countDocuments({});
    const totalPage = Math.ceil(totalData / limitData);

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    })
    .skip((pageData - 1) * limitData)
    .limit(limitData)
    .exec();

    // Mark notifications as read
    await Notification.updateMany(
      { userId, isReadUser: false },
      { $set: { isReadUser: true } }
    );

    let result =  {
      data: notifications,
      paginator: {
        currentPage: parseInt(pageData),
        limit: parseInt(limitData),
        totalPage,
        totalData,
      },
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllNotificationsForAdmin = async (req, res) => {
  try {
    const { limit, page } = req.query

    const limitData = limit ?? 10;
    const pageData = page ?? 1;

    const totalData = await Notification.countDocuments({});
    const totalPage = Math.ceil(totalData / limitData);

    // Fetch all notifications
    const notifications = await Notification.find()
      .populate({
        path: "userId",
        select: "name user_id",
      })
      .sort({ createdAt: -1 })
      .skip((pageData - 1) * limitData)
      .limit(limitData)
      .exec();

    let result =  {
      data: notifications,
      paginator: {
        currentPage: parseInt(pageData),
        limit: parseInt(limitData),
        totalPage,
        totalData,
      },
    };

    res.status(200).send(result);
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
  let api = `${BOT_API}/message-bot`;

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
          const detailOrder = `https://jkt48-showroom-git-feat-sharing-live-ikhbaldwiyan.vercel.app/sharing/ingin-bertemu/${sharingId}`

          /// SEND NOTIF TO DISCORD SERVER
          if (type === "register") {
            api = `${BOT_API}/sharing-live`
            message = `${username} Berhasil Register sharing live dengan order id **#${orderId}**`;
          } else if (type === "success") {
            message = `${username} pembayaran sharing live **${setlist}** berhasil, cek detail order disini: [Detail Order #${orderId}](${detailOrder})`;
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

exports.readNotificationAdmin = async (req,res) => {

  const { notification_ids } = req.body

  try {

    const update_isread = await Notification.updateMany({_id: { $in: notification_ids}}, {isReadAdmin: true});

    let response = responseSuccess(200, 'Success Update')

    res.status(200).json(response)
  } catch (error) {
    console.log('error', error)
    let response = responseError(500, error ? error.message : 'Internal Server error')
    res.status(500).json(response);
  }
}

exports.readNotification = async (req,res) => {

  const { notification_ids } = req.body

  try {

    const update_isread = await Notification.updateMany({_id: { $in: notification_ids}}, {isRead: true});

    let response = responseSuccess(200, 'Success Update')

    res.status(200).json(response)
  } catch (error) {
    console.log('error', error)
    let response = responseError(500, error ? error.message : 'Internal Server error')
    res.status(500).json(response);
  }
}

exports.countNotification = async (req, res) => {
  let statusCode = 500,
    response = responseError(statusCode, 'Internal Server Error')

  try {
    const { userId } = req.params;

    let countNotification = await Notification.find({ $and : [{isRead: false}, { userId }]}).countDocuments({}).exec()

    statusCode = 200
    response = responseSuccess(statusCode, 'Success', { totalCount : countNotification })
    
  } catch (error) {
    console.log('error', error.message)
    statusCode = 400
    response = responseError(statusCode, error.message)
  }finally {
    
    res.status(statusCode).json(response)
  }
}

exports.countNotificationAdmin = async (req, res) => {
  let statusCode = 500,
    response = responseError(statusCode, 'Internal Server Error')

  try {

    let countNotification = await Notification.find({isReadAdmin: false}).countDocuments({}).exec()

    statusCode = 200
    response = responseSuccess(statusCode, 'Success', { totalCount : countNotification })
    
  } catch (error) {
    console.log('error', error.message)
    statusCode = 400
    response = responseError(statusCode, error.message)
  }finally {
    
    res.status(statusCode).json(response)
  }
}