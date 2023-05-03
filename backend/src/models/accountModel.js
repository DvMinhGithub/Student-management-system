const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isDelete: { type: Boolean, default: false },
  role: {
    type: String,
    default: "student",
    enum: ["admin", "teacher", "student"],
  },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  refreshToken: { type: String },
});

module.exports = mongoose.model("Account", accountSchema);
