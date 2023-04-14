const teacherService = require('../services/teacherService');
module.exports = {
    getAllTeachers: async (req, res, next) => {
        try {
            const { data } = await teacherService.getAllTeachers();
            return res.status(200).json({ data });
        } catch (error) {
            next(error);
        }
    },
    addTeacher: async (req, res, next) => {
        try {
            const { code, message, data } = await teacherService.addTeacher({
                data: req.body,
            });
            res.status(code).json({ message, data });
        } catch (error) {
            next(error);
        }
    },
    updateTeacher: async (req, res, next) => {
        try {
            const teacherId = req.params.id;
            const { code, message, data } = await teacherService.updatedTeacher({
                teacherId,
                data: req.body,
            });
            res.status(code).json({ message, data });
        } catch (error) {
            next(error);
        }
    },
    uploadExcel: async (req, res, next) => {
        try {
            const file = req.file;
            const { code, ...rest } = await teacherService.uploadExcel({ file });
            return res.status(code).json({ ...rest });
        } catch (error) {
            next(error);
        }
    },
    deleteTeacher: async (req, res, next) => {
        try {
            const id = req.params.id;
            const { message } = await teacherService.deleteTeacher({ id });
            res.status(200).json({ message });
        } catch (error) {
            next(error);
        }
    },
};
