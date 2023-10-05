const { default: axios } = require("axios");
const { google } = require("googleapis");
const ANALYTICS_API =
  "https://analyticsdata.googleapis.com/v1beta/properties/373769110:runRealtimeReport";

const getToken = async () => {
  const jwtClient = new google.auth.JWT(
    process.env.ANALYTICS_EMAIL,
    undefined,
    process.env.ANALYTICS_KEY,
    ["https://www.googleapis.com/auth/analytics.readonly"],
    undefined
  );

  const token = await jwtClient.authorize();

  return token;
};

exports.getAnalyticsData = async (req, res) => {
  const {
    start_date = "yesterday",
    end_date = "today",
    dimensions = "ga%3ApagePath",
    metrics = "ga:pageviews, ga:users",
    sort = "-ga:pageviews",
    max_results = 20,
  } = req.body;

  try {
    const token = await getToken();

    const url = `https://www.googleapis.com/analytics/v3/data/ga?ids=ga:265603782&dimensions=${dimensions}&metrics=${metrics}&sort=${sort}&start-date=${start_date}&end-date=${end_date}&max-results=${max_results}`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.access_token}`,
    };

    const response = await axios.get(url, { headers });

    res.json(response.data);
  } catch (error) {
    console.error("Error get analytics data:", error);
    res.status(500).json({ error: error?.response });
  }
};

exports.getSingleToken = async (req, res) => {
  const jwtClient = new google.auth.JWT(
    process.env.ANALYTICS_EMAIL,
    undefined,
    process.env.ANALYTICS_KEY,
    ["https://www.googleapis.com/auth/analytics.readonly"],
    undefined
  );

  const token = await jwtClient.authorize();

  res.json(token);
};

exports.getRealTimeData = async (req, res) => {
  try {
    const token = await getToken();
    const { metrics = "unifiedScreenName", dimensions = "activeUsers" } =
      req.body;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.access_token}`,
    };

    const response = await axios.post(
      ANALYTICS_API,
      {
        dimensions: [{ name: metrics }],
        metrics: [{ name: dimensions }],
      },
      { headers }
    );
    const data = response.data;

    res.json({
      rows: data?.rows?.map((item) => ({
        name: item.dimensionValues[0].value,
        value: item.metricValues[0].value,
      })),
      orginalData: data,
    });
  } catch (error) {
    console.error("Error get analytics data:", error);
    res.status(500).json({ error: error?.response?.data?.error });
  }
};

exports.getRealTimeOnlineUsers = async (req, res) => {
  try {
    const token = await getToken();

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.access_token}`,
    };

    //real time users 30 minutes ago
    const users = await axios.post(
      ANALYTICS_API,
      {
        metrics: [
          {
            name: "activeUsers",
          },
        ],
        minuteRanges: [
          {
            name: "0-5 minutes ago",
            startMinutesAgo: 5,
          },
          {
            name: "30 minutes ago",
            startMinutesAgo: 29,
          },
        ],
      },
      { headers }
    );

    res.json({
      activeUsers: users?.data?.rows?.map((item) => ({
        name: item.dimensionValues[0].value,
        value: item.metricValues[0].value,
      })),
    });
  } catch (error) {
    console.error("Error get analytics data:", error);
    res.status(500).json({ error: error?.response?.data });
  }
};
