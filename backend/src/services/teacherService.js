const Course = require("../models/courseModel");
const Teacher = require("../models/teacherModel");
const Account = require("../models/accountModel");
const xlsx = require("xlsx");

const getUniqueTeacherCode = async () => {
  let currentDate = new Date();
  let year = currentDate.getFullYear().toString().substr(-2);
  let month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  let code = "GV" + year + month;
  const count = await Teacher.countDocuments({ code: { $regex: "^" + code } });
  let suffix = (count + 1).toString().padStart(3, "0");
  return code + suffix;
};
module.exports = {
  getAllTeachers: async () => {
    try {
      const allTeachers = await Teacher.find().populate("courses");
      return { data: allTeachers };
    } catch (error) {
      console.error(error);
    }
  },
  addTeacher: async ({ data }) => {
    try {
      const existingTeacher = await Teacher.findOne({ email: data.email });
      if (existingTeacher) {
        return { code: 400, message: "Giảng viên đã tồn tại" };
      }
      data.code = await getUniqueTeacherCode();
      const teacher = new Teacher(data);
      const newTeacher = await teacher.save();
      return {
        code: 201,
        message: "Thêm giảng viên thành công",
        data: newTeacher,
      };
    } catch (error) {
      console.error(error);
    }
  },
  // updatedTeacher: async ({ teacherId, data }) => {
  //     try {
  //         const oldTeacher = await Teacher.findById(teacherId);
  //         const oldCoursesObj = oldTeacher.courses;
  //         const oldCourses = oldCoursesObj.map((objId) => objId.toString());
  //         const newCourses = data.courses;
  //         const coursesToRemove = oldCourses.filter((courseId) => !newCourses.includes(courseId));
  //         const coursesToAdd = newCourses.filter((courseId) => !oldCourses.includes(courseId));
  //         data.courses = newCourses;
  //         await Teacher.findByIdAndUpdate(teacherId, data);
  //         await Course.updateMany({ _id: { $in: coursesToRemove } }, { $pull: { teachers: teacherId } });
  //         await Course.updateMany({ _id: { $in: coursesToAdd } }, { $push: { teachers: teacherId } });
  //         const teacherUpdated = await Teacher.findById(teacherId).populate('courses');
  //         return {
  //             code: 200,
  //             message: 'Cập nhật giảng viên thành công',
  //             data: teacherUpdated,
  //         };
  //     } catch (error) {
  //         console.error(error);
  //         return { code: 400, message: 'Cập nhật giảng viên thất bại' };
  //     }
  // },
  updatedTeacher: async ({ teacherId, data }) => {
    try {
      const oldTeacher = await Teacher.findById(teacherId);
      const oldCourses = oldTeacher.courses.map((course) => course.toString());
      const newCourses = data.courses.map((course) => course.toString());

      const coursesToRemove = oldCourses.filter(
        (courseId) => !newCourses.includes(courseId)
      );
      const coursesToAdd = newCourses.filter(
        (courseId) => !oldCourses.includes(courseId)
      );

      const teacherUpdated = await Teacher.findByIdAndUpdate(teacherId, data, {
        new: true,
      }).populate("courses");

      await Promise.all([
        Course.updateMany(
          { _id: { $in: coursesToRemove } },
          { $pull: { teachers: teacherId } }
        ),
        Course.updateMany(
          { _id: { $in: coursesToAdd } },
          { $push: { teachers: teacherId } }
        ),
      ]);

      return {
        code: 200,
        message: "Cập nhật giảng viên thành công",
        data: teacherUpdated,
      };
    } catch (error) {
      console.error(error);
      return { code: 400, message: "Cập nhật giảng viên thất bại" };
    }
  },

  deleteTeacher: async ({ id }) => {
    try {
      await Teacher.findByIdAndDelete(id);
      return { message: "Xóa giảng viên thành công" };
    } catch (error) {
      next(error);
    }
  },
  uploadExcel: async ({ file }) => {
    try {
      const workbook = xlsx.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      const teachersPromises = [];
      const accountPromises = [];

      for (const row of data) {
        const courseNames = row["Môn học"].includes(",")
          ? row["Môn học"].split(", ")
          : [row["Môn học"]];

        const courseIds = await Course.find({
          name: { $in: courseNames },
        }).select("_id");

        const newTeacher = new Teacher({
          code: await getUniqueTeacherCode(),
          email: row["Email"],
          name: row["Họ tên"],
          gender: row["Giới tính"],
          address: row["Địa chỉ"],
          phone: row["Số điện thoại"],
          courses: courseIds,
        });
        teachersPromises.push(newTeacher.save());

        const account = new Account({
          username: newTeacher.code,
          password: hashedPassword,
          user: newTeacher._id,
        });
        accountPromises.push(account.save());
      }

      await Promise.all([...teachersPromises, ...accountPromises]);

      const res = await Teacher.find().populate("courses");

      return { code: 201, message: "Đã tải thành công.", data: res };
    } catch (error) {
      console.error(error);
    }
  },
};
