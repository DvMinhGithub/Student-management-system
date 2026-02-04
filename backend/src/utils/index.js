const jwt = require("jsonwebtoken");

const Admin = require("../models/adminModel");
const Teacher = require("../models/teacherModel");
const Student = require("../models/studentModel");

module.exports = {
  getSchemaByRole: (role) => {
    let userSchema, charCode;

    switch (role) {
      case "admin":
        userSchema = Admin;
        charCode = "AD";
        break;
      case "student":
        userSchema = Student;
        charCode = "SV";
        break;
      case "teacher":
        userSchema = Teacher;
        charCode = "GV";
        break;
      default:
        return { code: 400, message: "Role không hợp lệ" };
    }
    return { userSchema, charCode };
  },

  generateTokens: (data) => {
    const accessToken = jwt.sign({ ...data }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES,
    });
    const refreshToken = jwt.sign({ ...data }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES,
    });
    return { accessToken, refreshToken };
  },
};
