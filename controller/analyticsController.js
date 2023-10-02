const { default: axios } = require("axios");
const { google } = require("googleapis");

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
    res.status(500).json({ error: "Error get analytics data" });
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
    const {
      metrics = "rt:activeUsers",
      dimensions = "ga:pagePath,ga:source,ga:deviceCategory",
    } = req.body;

    const url = `https://www.googleapis.com/analytics/v3/data/realtime?ids=ga:265603782&metrics=${metrics}&dimensions=${dimensions}`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.access_token}`,
    };

    const response = await axios.get(url, { headers });
    const data = response.data;

    res.json({
      activeUsers: data.totalsForAllResults["rt:activeUsers"],
      rows: data?.rows?.map((item) => ({
        page: item[0],
        source: item[1],
        users: item[3],
        device: item[2],
      })),
      orginalData: data
    });
  } catch (error) {
    console.error("Error get analytics data:", error);
    res.status(500).json({ error: "Error get analytics data" });
  }
};
