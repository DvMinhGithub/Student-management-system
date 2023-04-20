const bcrypt = require("bcrypt");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const Student = require("../models/studentModel");
const Course = require("../models/courseModel");
const Account = require("../models/accountModel");

const getUniqueCode = async () => {
  let currentDate = new Date();
  let year = currentDate.getFullYear().toString().substr(-2);
  let month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  let code = "SV" + year + month;
  const count = await Student.countDocuments({ code: { $regex: "^" + code } });
  let suffix = (count + 1).toString().padStart(3, "0");
  return code + suffix;
};
module.exports = {
  getStudents: async () => {
    try {
      const data = await Student.find({ isDelete: false }).populate("courses");
      return { data };
    } catch (error) {
      next(error);
    }
  },
  getStudentById: async ({ id }) => {
    try {
      const data = await Student.findById(id, { courses: 0 });
      return { data };
    } catch (error) {
      next(error);
    }
  },
  getDetailStudent: async (id) => {
    try {
      const student = await Student.findById(id);
      return { data: student };
    } catch (error) {
      console.error(error);
    }
  },
  addStudent: async ({ data }) => {
    try {
      const existingStudent = await Student.findOne({ email: data.email });
      if (existingStudent)
        return { code: 400, message: "Sinh viên đã tồn tại" };
      else {
        data.code = await getUniqueStudentCode();
        const student = await Student.create(data);
        return {
          code: 201,
          message: "Thêm sinh viên thành công",
          data: student,
        };
      }
    } catch (error) {
      console.error(error);
    }
  },
  updateStudent: async (studentId, body) => {
    try {
      const currentStudent = await Student.findById(id);
      const currentAvatarUrl = currentStudent.avatar;
      const newAvatarUrl = body.avatar

      if (newAvatarUrl) {
        if (currentAvatarUrl && currentAvatarUrl !== newAvatarUrl) {
          const oldAvatarPath = path.join(
            __dirname,
            "../../public",
            currentAvatarUrl.replace(`http://localhost:${process.env.PORT}`, "")
          );
          if (fs.existsSync(oldAvatarPath)) fs.unlinkSync(oldAvatarPath)
        }
      }

      const student = await Student.findByIdAndUpdate(
        studentId,
        { $set: body },
        { new: true }
      );
      return {
        code: 201,
        message: "Cập nhật sinh viên thành công.",
        data: student,
      };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Lỗi khi cập nhật sinh viên" };
    }
  },
  deleteStudent: async ({ id }) => {
    try {
      await Promise.all([
        Student.findByIdAndUpdate(id, { isDelete: true }),
        Account.findOneAndUpdate({ student: id }, { isDelete: true }),
      ]);
      return { message: "Xóa sinh viên thành công." };
    } catch (error) {
      next(error);
    }
  },

  registerCourse: async ({ studentId, courseId }) => {
    try {
      const [student, course] = await Promise.all([
        Student.findById(studentId),
        Course.findById(courseId),
      ]);

      if (student.courses.includes(courseId)) {
        return { code: 409, message: "Bạn đã đăng ký môn học này." };
      }

      student.courses.push(courseId);
      await student.save();

      course.students.push(studentId);
      await course.save();

      return {
        code: 200,
        message: "Đăng ký học thành công",
        data: course,
      };
    } catch (error) {
      console.error(error);
    }
  },

  cancelRegisterCourse: async ({ studentId, courseId }) => {
    try {
      const result = await Promise.all([
        Student.findOneAndUpdate(
          { _id: studentId },
          { $pull: { courses: courseId } }
        ),
        Course.findOneAndUpdate(
          { _id: courseId },
          { $pull: { students: studentId } }
        ),
      ]);
      if (result.some((res) => !res)) {
        return {
          code: 404,
          message: "Không tìm thấy sinh viên hoặc môn học",
        };
      }
      return {
        code: 200,
        message: "Hủy Đăng ký môn học thành công.",
      };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Lỗi khi hủy đăng ký môn học" };
    }
  },
  uploadExcel: async ({ file }) => {
    try {
      const workbook = xlsx.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      const studentPromises = [];
      const accountPromises = [];

      for (const row of data) {
        const hashedPassword = await bcrypt.hash(
          row["Số điện thoại"].toString(),
          10
        );

        const newStudent = new Student({
          code: await getUniqueCode(),
          email: row["Email"],
          name: row["Họ tên"],
          gender: row["Giới tính"],
          address: row["Địa chỉ"],
          phone: row["Số điện thoại"],
        });

        studentPromises.push(newStudent.save());

        const account = new Account({
          username: newStudent.code,
          password: hashedPassword,
          student: newStudent._id,
        });

        accountPromises.push(account.save());
      }

      await Promise.all([...studentPromises, ...accountPromises]);

      const res = await Student.find();

      return { code: 201, message: "Đã tải thành công.", data: res };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Lỗi khi tải excel" };
    }
  },
};
