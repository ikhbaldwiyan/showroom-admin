const idnHistoryLive = require("../models/IdnLiveHistory");
const Activity = require("../models/Activity");
const { responseSuccess, responseError } = require("../utils/response");

const idnHistoryLiveController = {
  getAllHistory: async (req, res) => {
    let statusCode = 500,
      result = responseError(statusCode, "Internal Server Error");

    try {
      const { limit, page } = req.query;

      const limitData = limit ?? 10;
      const pageData = page ?? 1;

      const totalData = await idnHistoryLive.countDocuments({});
      const totalPage = Math.ceil(totalData / limitData);

      let allLiveHistory = await idnHistoryLive
        .find()
        .sort("-date")
        .skip((pageData - 1) * limitData)
        .limit(limitData)
        .exec();

      const profilePromises = allLiveHistory.map(async (history) => {
        const watchingUser = await Activity.find({
          live_id: history?.live_id,
          log_name: "Watch",
        }).countDocuments();

        let result = {
          watchingUser,
          history,
        };

        return result;
      });

      const combinedData = await Promise.all(profilePromises);

      let allHistory = {
        data: combinedData,
        pagination: {
          currentPage: parseInt(pageData),
          limit: parseInt(limitData),
          totalPage,
          totalData,
        },
      };

      statusCode = 200;
      result = responseSuccess(200, "Success", allHistory);
    } catch (error) {
      console.log("error", error);
      statusCode = 400;
      result = responseError(400, error);
    } finally {
      res.status(statusCode).json(result);
    }
  },

  getIdnHistoryDetail: async (req, res) => {
    const { id } = req.params;
    try {
      const liveData = await idnHistoryLive.findOne({ live_id: id });

      const populateData = {
        path: "user",
        select: "name user_id avatar",
      };

      const watch = await Activity.find({
        live_id: id,
        log_name: "Watch",
      }).populate(populateData);

      if (!liveData) {
        throw Error("Live not found");
      }

      res.json({
        liveData: {
          ...liveData._doc,
          users: watch.length,
        },
        activityLog: {
          watch,
        },
      });
    } catch (error) {
      console.log("error", error);
      result = responseError(400, "Live Not Found");
      return res.status(404).json(result);
    }
  },

  getIdnHistoryMember: async (req, res) => {
    try {
      const historyMember = await idnHistoryLive.find({
        username: req.params.username,
      });

      if (historyMember.length === 0) {
        throw Error("Member Live not found");
      }

      res.json({
        totalData: historyMember.length,
        data: historyMember,
      });
    } catch (error) {
      console.log("error", error);
      result = responseError(400, "History Member Live not found");
      return res.status(404).json(result);
    }
  },
};

module.exports = idnHistoryLiveController;
