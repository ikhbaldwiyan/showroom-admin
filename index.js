const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const middleware = require("./utils/jwtMiddleware");

const userRoute = require("./routes/userRoute");
const scheduleRoutes = require("./routes/scheduleRoutes");
const memberRoutes = require("./routes/memberRoutes");
const setlistRoutes = require("./routes/setlistRoutes");
const premiumLiveRoutes = require("./routes/premiumLiveRoutes");
const taskRoutes = require("./routes/taskRoutes");
const activityRoutes = require("./routes/activityRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const historyLiveRoutes = require("./routes/historyLiveRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const sharingLiveRoutes = require("./routes/sharingLiveRoutes");
const scrapperRoutes = require("./routes/scrapperRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const discordRoutes = require('./routes/discordRoute')
const idnHistoryLive = require('./routes/idnHistoryLiveRoutes')

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("image"));
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Server Running on http://localhost:8000");

    app.use("/users", userRoute);
    app.use("/schedules", scheduleRoutes);
    app.use("/setlists", setlistRoutes);
    app.use("/member", middleware, memberRoutes);
    app.use("/premium-lives", premiumLiveRoutes);
    app.use("/tasks", taskRoutes);
    app.use("/activity", activityRoutes);
    app.use("/admin-users", middleware, adminRoutes);
    app.use("/history-live", historyLiveRoutes);
    app.use("/login", authRoutes);
    app.use("/dashboard", dashboardRoutes);
    app.use("/leaderboard", leaderboardRoutes);
    app.use("/analytics", analyticsRoutes);
    app.use("/sharing-live", sharingLiveRoutes);
    app.use("/scrapper", scrapperRoutes);
    app.use("/notifications", notificationRoutes);
    app.use("/discord", discordRoutes);
    app.use("/idn-live-history", idnHistoryLive);

    app.get("/", (req, res) => {
      res.send({
        message: "Welcome To JKT48 Showroom Admin",
      });
    });

    // Start the server
    app.listen(8000, () => {
      console.log(`Server Running`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
