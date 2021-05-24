const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const roleSchema = new Schema({
  roleName: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});
module.exports = mongoose.model("roles", roleSchema);
