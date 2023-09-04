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
