const authService = require("./authService");
module.exports = {
  register: async (req, res, next) => {
    try {
      const { code, message } = await authService.register(req.body);
      return res.status(code).json({ message });
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
  refresh: async (req, res, next) => {
    try {
      const { code, ...rest } = await authService.refresh(req.body);
      return res.status(code).json({ ...rest });
    } catch (error) {
      next(error);
    }
  },
};
