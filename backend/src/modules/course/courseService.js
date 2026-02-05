const xlsx = require("xlsx");

const Course = require("./courseModel");
const Semester = require("../semester/semesterModel");
const Student = require("../student/studentModel");

module.exports = {
  createCourse: async (body) => {
    const existingCourse = await Course.findOne({ code: body.code });
    if (existingCourse) {
      return { code: 400, message: "Mã môn học đã được sử dụng." };
    }

    try {
      await Course.create(body);
      const createdCourse = await Course.findOne({ code: body.code }).populate(
        "semesters"
      );
      return {
        code: 201,
        data: createdCourse,
        message: "Thêm môn học thành công !",
      };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Lỗi hệ thống, vui lòng thử lại sau." };
    }
  },

  getAllCourses: async () => {
    try {
      const courses = await Course.find()
        .populate("teachers")
        .populate("semesters");
      return { code: 200, data: courses };
    } catch (error) {
      console.error(error);
    }
  },
  updateCourseById: async (id, data) => {
    try {
      const oldCourse = await Course.findById(id);
      const oldSemester = oldCourse.semesters.map((course) =>
        course.toString()
      );
      const newSemester = data.semesters.map((course) => course.toString());

      const semesterToRemove = oldSemester.filter(
        (courseId) => !newSemester.includes(courseId)
      );
      const semesterToAdd = newSemester.filter(
        (courseId) => !oldSemester.includes(courseId)
      );
      const courseUpdated = await Course.findByIdAndUpdate(id, data, {
        new: true,
      }).populate("semesters");
      await Promise.all([
        Semester.updateMany(
          { _id: { $in: semesterToRemove } },
          { $pull: { courses: id } }
        ),
        Semester.updateMany(
          { _id: { $in: semesterToAdd } },
          { $push: { courses: id } }
        ),
      ]);

      return {
        code: 200,
        message: "Cập nhật môn học thành công.",
        data: courseUpdated,
      };
    } catch (error) {
      console.error(error.message);
      return { code: 500, message: "Lỗi hệ thống, vui lòng thử lại sau" };
    }
  },
  deleteCourseById: async (id) => {
    try {
      const course = await Course.findByIdAndDelete(id);
      if (!course) return { code: 404, message: "Không tìm thấy môn học." };
      return {
        code: 201,
        message: "Xóa môn học thành công.",
      };
    } catch (error) {
      console.error(error);
    }
  },
  uploadExcel: async ({ file }) => {
    try {
      const workbook = xlsx.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      const coursesToInsert = [];

      for (const row of data) {
        const semesterNames = row["Học kỳ"].includes(",")
          ? row["Học kỳ"].split(", ")
          : [row["Học kỳ"]];

        const semesterIds = await Semester.find({
          name: { $in: semesterNames },
        }).select("_id");

        const course = new Course({
          code: row["Mã học phần"],
          name: row["Tên học phần"],
          credits: row["Số TC"],
          semesters: semesterIds,
        });

        coursesToInsert.push(course);
      }

      await Course.insertMany(coursesToInsert);
      const res = await Course.find().populate("semesters");
      return { code: 201, message: "Đã tải thành công.", data: res };
    } catch (error) {
      console.error(error.message);
    }
  },
};
