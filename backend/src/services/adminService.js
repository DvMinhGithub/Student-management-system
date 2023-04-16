const Admin = require("../models/adminModel");

module.exports = {
  getDetailAdmin: async (id) => {
    try {
      const admin = await Admin.findById(id);
      return { code: 200, data: admin };
    } catch (error) {
      console.error(error);
      return {
        code: 500,
        message: "Lỗi hệ thống, vui lòng thử lại sau.",
      };
    }
  },
  updateAdmin: async (id, body) => {
    try {
      const updatedData = await Admin.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true }
      );
      return {
        code: 201,
        message: "Cập nhật thành công.",
        data: updatedData,
      };
    } catch (error) {
      console.error(error);
      return {
        code: 500,
        message: "Lỗi hệ thống, vui lòng thử lại sau.",
      };
    }
  },
};
