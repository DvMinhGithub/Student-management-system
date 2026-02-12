const studentService = require("./studentService");
const config = require("#shared/config/index.js");
module.exports = {
  getAllStudents: async (req, res, next) => {
    try {
      const { data } = await studentService.getStudents();
      return res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  },
  getDetailStudent: async (req, res, next) => {
    try {
      const { data } = await studentService.getDetailStudent(req.params.id);
      return res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  },
  addStudent: async (req, res, next) => {
    try {
      const { message, data, code } = await studentService.addStudent({
        data: req.body,
      });
      res.status(code).json({ message, data });
    } catch (error) {
      next(error);
    }
  },
  updateStudent: async (req, res, next) => {
    try {
      const { id } = req.params;
      const payload = { ...req.body };
      if (req.file?.filename) {
        payload.avatar = `${config.baseUrl}/images/${req.file.filename}`;
      }

      const { code, message, data } = await studentService.updateStudent(
        id,
        payload
      );
      return res.status(code).json({ message, data });
    } catch (error) {
      next(error);
    }
  },

  deleteStudent: async (req, res, next) => {
    try {
      const id = req.params.id;
      const { message } = await studentService.deleteStudent({ id });
      res.status(200).json({ message });
    } catch (error) {
      next(error);
    }
  },
  registerCourse: async (req, res, next) => {
    try {
      const { code, message, data } = await studentService.registerCourse({
        studentId: req.params.id,
        courseId: req.body.courseId,
      });
      res.status(code).json({ message, data });
    } catch (error) {
      next(error);
    }
  },
  cancelRegisterCourse: async (req, res, next) => {
    try {
      const studentId = req.params.id;
      const courseId = req.body.courseId;
      const { code, message } = await studentService.cancelRegisterCourse({
        studentId,
        courseId,
      });
      res.status(code).json({ message });
    } catch (error) {
      next(error);
    }
  },
  uploadExcel: async (req, res, next) => {
    try {
      const file = req.file;
      const { code, ...rest } = await studentService.uploadExcel({ file });
      return res.status(code).json({ ...rest });
    } catch (error) {
      next(error);
    }
  },
};
