const jwt = require("jsonwebtoken");

const Admin = require("../models/adminModel");
const Teacher = require("../models/teacherModel");
const Student = require("../models/studentModel");
const { ROLES } = require("../constants/roles");

const ROLE_CONFIG = {
  [ROLES.ADMIN]: { code: "AD", model: Admin },
  [ROLES.TEACHER]: { code: "GV", model: Teacher },
  [ROLES.STUDENT]: { code: "SV", model: Student },
};

const buildCodePrefix = (charCode) => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${charCode}${year}${month}`;
};

module.exports = {
  ROLES,
  getSchemaByRole: (role) => {
    const config = ROLE_CONFIG[role];
    if (!config) {
      return { code: 400, message: "Role không hợp lệ" };
    }
    return { userSchema: config.model, charCode: config.code };
  },

  generateUniqueCode: async (model, charCode) => {
    const prefix = buildCodePrefix(charCode);
    const count = await model.countDocuments({ code: { $regex: `^${prefix}` } });
    const suffix = String(count + 1).padStart(3, "0");
    return `${prefix}${suffix}`;
  },

  generateUniqueCodeByRole: async (role) => {
    const config = ROLE_CONFIG[role];
    if (!config) {
      throw new Error("Role không hợp lệ");
    }
    return module.exports.generateUniqueCode(config.model, config.code);
  },

  generateTokens: (data) => {
    const accessToken = jwt.sign({ ...data }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES || "15m",
    });
    const refreshToken = jwt.sign({ ...data }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES || "7d",
    });
    return { accessToken, refreshToken };
  },
};
