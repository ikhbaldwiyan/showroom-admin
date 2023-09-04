const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser"); 

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await AdminUser.findOne({ username });
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!user || !passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "7d",
    });

    res.json({ username, message: "Login admin success", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Login failed." });
  }
};