const User = require("../models/User");
const Activity = require("../models/Activity");
const { responseSuccess, responseError } = require("../utils/response");
const moment = require("moment");

exports.getLeaderboard = async (req, res) => {
  let statusCode = 500,
    response = responseError(statusCode, "Internal Server Error");

  try {
    const { filterBy, platform } = req.query;

    let sort = "totalWatchLive";
    let result = {};

    if (platform) {
      if (platform === "Showroom") sort = "watchShowroomMember";
      else if (platform === "IDN") sort = "watchLiveIDN";
      else throw new Error("Filter by platform must be Shworoom or IDN");
    }

    if (filterBy) {
      let startDate;
      let endDate;

      let monthParam = req.query.month || moment().format("MM-YYYY"); // Assuming the month is provided as a query parameter

      // Validate month parameter
      if (!/^\d{2}-\d{4}$/.test(monthParam)) {
        throw new Error(
          "Invalid month parameter format. Please provide month in MM-YYYY format."
        );
      }

      // Parse the provided month parameter
      let [month, year] = monthParam.split("-");
      month = parseInt(month);
      year = parseInt(year);

      if (isNaN(month) || month < 1 || month > 12) {
        throw new Error(
          "Invalid month number. Month must be between 1 and 12."
        );
      }

      if (filterBy === "month") {
        startDate = new Date(moment(`${month}-01-${year}`).startOf("month"));
        endDate = new Date(moment(`${month}-01-${year}`).endOf("month"));
      }

      let activity_log = await Activity.find()
        .where({
          $and: [
            { log_name: "Watch" },
            {
              timestamp: {
                $lte: endDate,
                $gte: startDate,
              },
            },
          ],
        })
        .select("_id user log_name description");

      // Aggregate activity logs to get total watch time for each user
      let filteredUsers = {};
      for (const activity of activity_log) {
        const userId = activity.user.toString(); // Assuming user is stored as ObjectId
        if (!filteredUsers[userId]) {
          filteredUsers[userId] = {
            _id: userId,
            totalWatchLive: 0,
            watchLiveIDN: 0,
            watchShowroomMember: 0,
          };
        }
        filteredUsers[userId].totalWatchLive++;
        if (activity.description.includes("Watch Live")) {
          filteredUsers[userId].watchShowroomMember++;
        } else if (activity.description.includes("Watch IDN Live")) {
          filteredUsers[userId].watchLiveIDN++;
        }
      }

      // Convert the filteredUsers to an array for sorting
      let usersWithWatchTime = Object.values(filteredUsers);

      // Sort the array by the specified platform in descending order
      usersWithWatchTime.sort((a, b) => {
        return b[sort] - a[sort];
      });

      // Pagination
      const pageData = parseInt(req.query.page) || 1; // Current page, default to 1
      const limitData = 10; // Limit of data per page

      const startIndex = (pageData - 1) * limitData;
      const endIndex = startIndex + limitData;

      let paginatedUsers = usersWithWatchTime.slice(startIndex, endIndex);

      // Fetch user data and map with watch time for paginated users
      paginatedUsers = await Promise.all(
        paginatedUsers.map(async (userData) => {
          const user = await User.findById(userData._id)
            .select("_id user_id name avatar")
            .exec();
          return {
            ...userData,
            user_id: user.user_id,
            name: user.name,
            avatar: user.avatar,
          };
        })
      );

      result = {
        data: paginatedUsers,
        pagination: {
          currentPage: pageData,
          limit: limitData,
          totalData: usersWithWatchTime.length,
          totalPage: Math.ceil(usersWithWatchTime.length / limitData),
        },
      };
    }

    const { limit, page } = req.query;

    const limitData = limit ?? 10;
    const pageData = page ?? 1;

    const totalData = await User.countDocuments({});
    const totalPage = Math.ceil(totalData / limitData);

    const users = await User.find()
      .select(
        "_id name user_id avatar totalWatchLive watchLiveIDN watchShowroomMember"
      )
      .sort({ [sort]: -1 })
      .skip((pageData - 1) * limitData)
      .limit(limitData)
      .exec();

    if (!filterBy) {
      result = {
        data: users,
        pagination: {
          currentPage: parseInt(pageData),
          limit: parseInt(limitData),
          totalData,
          totalPage,
        },
      };
    }

    statusCode = 200;
    response = responseSuccess(200, "Success", result);
  } catch (error) {
    console.log("Error Controller Get Leaderboard : ", error.message);
    statusCode = 400;
    response = responseError(statusCode, error.message);
  }

  return res.status(statusCode).json(response);
};

exports.getUsers = async (req, res) => {
  const users = await User.find();
  const leaderboard = users.sort((a, b) => b.level - a.level);

  const leaderboardData = leaderboard.slice(0, 10).map((user) => ({
    name: user.name,
    points: user.points,
    experience: user.experience,
    level: user.level,
  }));

  res.json(leaderboardData);
};

exports.seeeder = async () => {
  const limit = 200;
  const page = 11;

  console.log("Start running");

  let beforeTime = await new Date();

  let totaldata = await User.countDocuments({});
  let totalPage = Math.ceil(totaldata / limit);

  const users = await User.find()
    .select("_id name")
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  for (let user of users) {
    console.log("start find user");

    const watchLiveIDN = await Activity.find({
      $and: [
        { log_name: "Watch" },
        { description: { $regex: "watch IDN", $options: "i" } },
        { user: user._id },
      ],
    })
      .select("_id log_name description")
      .countDocuments({});

    const watchLiveShowroom = await Activity.find({
      $and: [
        { log_name: "Watch" },
        { description: { $regex: "watch live", $options: "i" } },
        { user: user._id },
      ],
    }).select("_id log_name description");

    const watchLiveMultiroom = await Activity.find({
      $and: [
        { log_name: "Watch" },
        { description: { $regex: "Watch Multi Room", $options: "i" } },
        { user: user._id },
      ],
    })
      .select("_id log_name description")
      .countDocuments({});

    let watchLiveOfficialJKTShowroom = 0;
    let watchShowroomMember = 0;

    for (let liveShowroom of watchLiveShowroom) {
      if (liveShowroom.description.includes("SHOWROOM"))
        watchLiveOfficialJKTShowroom += 1;
      else watchShowroomMember += 1;
    }

    let totalWatchLive =
      watchLiveIDN +
      watchLiveOfficialJKTShowroom +
      watchShowroomMember +
      watchLiveMultiroom;

    const dataLiveCount = {
      watchLiveIDN,
      watchLiveOfficialJKTShowroom,
      watchShowroomMember,
      watchLiveMultiroom,
      totalWatchLive,
    };

    await User.findOneAndUpdate({ _id: user._id }, { $set: dataLiveCount });

    console.log("finish update user");
  }

  let userData = {
    // data: users,
    pagination: {
      currentPage: page,
      limit: limit,
      totaldata,
      totalPage,
    },
  };

  console.log("User", userData);

  let afterTime = await new Date();

  let totalTime = afterTime - beforeTime;

  console.log(
    `Get Activity Log and update user , Execution Time ${totalTime} ms`
  );
};
