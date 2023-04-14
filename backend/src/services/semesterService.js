const Semester = require("../models/semesterModel");

module.exports = {
  // Create a new semester
  createSemester: async (data) => {
    try {
      const semester = await Semester.create(data);
      return { code: 200, message: "Tạo học kỳ thành công", data: semester };
    } catch (error) {
      console.error(error.message);
      return { code: 500, message: error.message };
    }
  },
  // Get all semesters
  getSemesters: async () => {
    try {
      const semesters = await Semester.find().populate("courses").exec();
      return { code: 200, data: semesters };
    } catch (error) {
      console.error(error);
      return { code: 500, message: error.message };
    }
  },
  // Get a single semester by ID
  getSemesterById: async (id) => {
    try {
      const semester = await Semester.findById(id).populate("courses");
      if (!semester) {
        return { code: 404, message: "Không tìm thấy kỳ học" };
      }
      return { code: 200, data: semester };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Lỗi khi lấy thông tin kỳ học" };
    }
  },
  // Update a semester by ID
  updateSemester: async (id, data) => {
    try {
      const semesterUpdated = await Semester.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );
      if (!semesterUpdated) {
        return { code: 404, message: "Không tìm thấy học kỳ" };
      }
      return {
        code: 200,
        message: "Cập nhật học kỳ thành công",
        data: semesterUpdated,
      };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Lỗi khi cập nhật học kỳ" };
    }
  },
  // Delete a semester by ID
  deleteSemester: async (id) => {
    try {
      const semester = await Semester.findByIdAndDelete(id);
      if (!semester) return { code: 404, message: "Học kỳ không tồn tại" };
      return {
        code: 200,
        message: "Xóa học kỳ thành công",
        data: null,
      };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Lỗi khi xóa học kỳ" };
    }
  },
};
