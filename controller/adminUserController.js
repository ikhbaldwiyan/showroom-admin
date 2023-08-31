const bcrypt = require("bcrypt");
const AdminUser = require("../models/AdminUser"); 

exports.createAdminUser = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await AdminUser.create({
      name,
      username,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to register user." });
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    const adminUsers = await AdminUser.find();
    res.status(200).json(adminUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve admin users." });
  }
};

exports.getAdminUserById = async (req, res) => {
  try {
    const adminUser = await AdminUser.findById(req.params.id);
    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found." });
    }
    res.status(200).json(adminUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve admin user." });
  }
};

exports.updateAdminUser = async (req, res) => {
  try {
    const adminUser = await AdminUser.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found." });
    }
    res.status(200).json(adminUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update admin user." });
  }
};

exports.deleteAdminUser = async (req, res) => {
  try {
    const adminUser = await AdminUser.findByIdAndDelete(req.params.id);
    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found." });
    }
    res.status(500).json({ message: "User succesfully deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete admin user." });
  }
};
