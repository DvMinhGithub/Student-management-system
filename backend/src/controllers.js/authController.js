const authService = require('../services/authService');
module.exports = {
    register: async (req, res, next) => {
        try {
            const { code, data, message } = await authService.register({
                body: req.body,
            });
            return res.status(code).json({ data, message });
        } catch (error) {
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            const { code, ...rest } = await authService.login(req.body);
            return res.status(code).json({ ...rest });
        } catch (error) {
            next(error);
        }
    },
};
