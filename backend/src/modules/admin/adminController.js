const adminService = require("./adminService");
const config = require("#shared/config/index.js");

module.exports = {
  getDetailAdmin: async (req, res, next) => {
    try {
      const id = req.params.id;
      const { code, data } = await adminService.getDetailAdmin(id);
      return res.status(code).json({ data });
    } catch (error) {
      next(error);
    }
  },
  updateAdmin: async (req, res, next) => {
    try {
      const updateData = { ...req.body };
      if (req.file?.filename) {
        updateData.avatar = `${config.baseUrl}/images/${req.file.filename}`;
      }

      const { code, ...rest } = await adminService.updateAdmin(
        req.params.id,
        updateData
      );
      return res.status(code).json({ ...rest });
    } catch (error) {
      next(error);
    }
  },
};
