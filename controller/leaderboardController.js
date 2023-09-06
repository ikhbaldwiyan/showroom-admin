const User = require("../models/User");

exports.getLeaderboard = async (req, res) => {
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
