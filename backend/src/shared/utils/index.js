const jwt = require("jsonwebtoken");
const config = require("#shared/config/index.js");

const Admin = require("#modules/admin/adminModel.js");
const Teacher = require("#modules/teacher/teacherModel.js");
const Student = require("#modules/student/studentModel.js");
const { ROLE_MAP } = require("#shared/constants/roles.js");

const ROLE_CONFIG = {
  [ROLE_MAP.ADMIN?.role]: { code: ROLE_MAP.ADMIN?.code, model: Admin },
  [ROLE_MAP.TEACHER?.role]: { code: ROLE_MAP.TEACHER?.code, model: Teacher },
  [ROLE_MAP.STUDENT?.role]: { code: ROLE_MAP.STUDENT?.code, model: Student },
};

const buildCodePrefix = (charCode) => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${charCode}${year}${month}`;
};

module.exports = {
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
    const accessToken = jwt.sign({ ...data }, config.jwt.secret, {
      expiresIn: config.jwt.accessExpires,
    });
    const refreshToken = jwt.sign({ ...data }, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpires,
    });
    return { accessToken, refreshToken };
  },
};
