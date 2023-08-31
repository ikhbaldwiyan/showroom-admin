const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
}, {
  collection: 'admin-users'
});

const AdminUser = mongoose.model("AdminUser", adminUserSchema);

module.exports = AdminUser;
