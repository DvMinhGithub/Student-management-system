const mongoose = require("mongoose");
const { ROLE_MAP } = require("#shared/constants/roles.js");

const ROLE_KEYS = Object.values(ROLE_MAP).map((role) => role.role);
const DEFAULT_ROLE = ROLE_KEYS.includes(ROLE_MAP.STUDENT.role)
  ? ROLE_MAP.STUDENT.role
  : ROLE_KEYS[0];

const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isDelete: { type: Boolean, default: false },
  role: {
    type: String,
    default: DEFAULT_ROLE,
    enum: ROLE_KEYS,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ROLE_MAP.ADMIN.model,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ROLE_MAP.TEACHER.model,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ROLE_MAP.STUDENT.model,
  },
  refreshToken: { type: String },
});

module.exports = mongoose.model("Account", accountSchema);
