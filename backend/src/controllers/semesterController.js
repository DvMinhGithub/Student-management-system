const semesterService = require('../services/semesterService');
module.exports = {
    createSemester: async (req, res, next) => {
        try {
            const { code, message, data } = await semesterService.createSemester(req.body);
            return res.status(code).json({ message, data });
        } catch (error) {
            next(error);
        }
    },
    getSemesters: async (req, res, next) => {
        try {
            const { code, message, data } = await semesterService.getSemesters();
            return res.status(code).json({ message, data });
        } catch (error) {
            next(error);
        }
    },
    getSemesterById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const { code, message, data } = await semesterService.getSemesterById(id);
            return res.status(code).json({ message, data });
        } catch (error) {
            next(error);
        }
    },
    updateSemester: async (req, res, next) => {
        try {
            const id = req.params.id;
            const dataUpdate = req.body;
            const { code, message, data } = await semesterService.updateSemester(id, dataUpdate);
            return res.status(code).json({ message, data });
        } catch (error) {
            next(error);
        }
    },
    deleteSemester: async (req, res, next) => {
        try {
            const id = req.params.id;
            const { code, message } = await semesterService.deleteSemester(id);
            return res.status(code).json({ message });
        } catch (error) {
            next(error);
        }
    },
};
