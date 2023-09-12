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
    const { name, username, new_password, old_password } = req.body;
    const adminUser = await AdminUser.findById(req.params.id);

    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found." });
    }

    // If the old password is provided, verify it
    if (old_password) {
      const isMatch = await bcrypt.compare(old_password, adminUser.password);

      if (!isMatch) {
        return res.status(400).json({ message: "old_password is incorrect." });
      }

      // Hash and update the new password
      const hashedPassword = await bcrypt.hash(new_password, 10);
      adminUser.password = hashedPassword;
    }

    if (new_password && !old_password) {
      return res.status(400).json({ message: "old_password is required." });
    }

    // Update name and username
    if (name) {
      adminUser.name = name;
    }

    if (username) {
      adminUser.username = username;
    }

    // Save the updated admin user
    await adminUser.save();

    res.status(200).json(adminUser);
  } catch (error) {
    console.log(error);
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
