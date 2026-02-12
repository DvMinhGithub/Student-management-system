const fs = require("fs");
const path = require("path");

const Admin = require("./adminModel");
const config = require("#shared/config/index.js");
const PUBLIC_DIR = path.resolve(process.cwd(), "public");

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
      const currentAdmin = await Admin.findById(id);
      if (!currentAdmin) {
        return { code: 404, message: "Không tìm thấy admin." };
      }

      const currentAvatarUrl = currentAdmin.avatar;
      const newAvatarUrl = body.avatar;

      if (newAvatarUrl) {
        if (currentAvatarUrl && currentAvatarUrl !== newAvatarUrl) {
          const relativePath = currentAvatarUrl
            .replace(config.baseUrl, "")
            .replace(/^\/+/, "");
          const oldAvatarPath = path.join(PUBLIC_DIR, relativePath);
          if (fs.existsSync(oldAvatarPath)) fs.unlinkSync(oldAvatarPath);
        }
      }

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
