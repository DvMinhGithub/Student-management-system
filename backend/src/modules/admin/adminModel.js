const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  gender: { type: String },
  phone: { type: String },
  address: { type: String },
  dateOfBirth: { type: Date },
  placeOfBirth: { type: String },
  avatar: { type: String },
  isDelete: { type: Boolean, default: false },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
});

module.exports = mongoose.model("Admin", adminSchema);
