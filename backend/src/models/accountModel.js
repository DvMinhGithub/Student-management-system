const mongoose = require("mongoose");
const { ROLES, MODEL_NAMES } = require("../constants/roles");

const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isDelete: { type: Boolean, default: false },
  role: {
    type: String,
    default: ROLES.STUDENT,
    enum: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
  },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: MODEL_NAMES.ADMIN },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: MODEL_NAMES.TEACHER },
  student: { type: mongoose.Schema.Types.ObjectId, ref: MODEL_NAMES.STUDENT },
  refreshToken: { type: String },
});

module.exports = mongoose.model("Account", accountSchema);
