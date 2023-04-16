const adminService = require("../services/adminService");

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
      updateData.avatar =
        req.file?.filename &&
        `http://localhost:${process.env.PORT}/images/${req.file.filename}`;

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
