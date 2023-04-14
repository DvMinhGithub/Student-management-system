const courseService = require('../services/courseService');
module.exports = {
    createCourse: async (req, res, next) => {
        try {
            const { code, data, message } = await courseService.createCourse(req.body);
            return res.status(code).json({ data, message });
        } catch (error) {
            next(error);
        }
    },
    getAllCourses: async (req, res, next) => {
        try {
            const { data } = await courseService.getAllCourses();
            return res.json({ data });
        } catch (error) {
            next(error);
        }
    },
    updateCourseById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const { code, message, data } = await courseService.updateCourseById(id, req.body);
            return res.status(code).json({ message, data });
        } catch (error) {
            next(error);
        }
    },
    deleteCourseById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const { code, message } = await courseService.deleteCourseById(id);
            return res.status(code).json({ message });
        } catch (error) {
            next(error);
        }
    },
    getCourseByStudentId: async (req, res, next) => {
        try {
            const id = req.params.id;
            const { data } = await courseService.getCourseByStudentId({
                id,
            });
            return res.status(200).json({ data });
        } catch (error) {
            next(error);
        }
    },
    uploadExcel: async (req, res, next) => {
        try {
            const file = req.file;
            const { code, ...rest } = await courseService.uploadExcel({ file });
            return res.status(code).json({ ...rest });
        } catch (error) {
            next(error);
        }
    },
};
