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
};
