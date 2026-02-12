const bcrypt = require("bcryptjs");

const Account = require("./accountModel");
const Admin = require("#modules/admin/adminModel.js");
const Teacher = require("#modules/teacher/teacherModel.js");
const Student = require("#modules/student/studentModel.js");
const { getSchemaByRole, generateUniqueCodeByRole } = require("#shared/utils/index.js");
const { ROLE_MAP } = require("#shared/constants/roles.js");

const ADMIN_ROLE = ROLE_MAP.ADMIN.role;
const TEACHER_ROLE = ROLE_MAP.TEACHER.role;
const STUDENT_ROLE = ROLE_MAP.STUDENT.role;
const PASSWORD_MIN_LENGTH = 8;

module.exports = {
  getAllAccounts: async () => {
    try {
      const accounts = await Account.find({ isDelete: false })
        .sort("role")
        .populate(ADMIN_ROLE)
        .populate(TEACHER_ROLE)
        .populate(STUDENT_ROLE);
      return { data: accounts };
    } catch (error) {
      console.error(error);
    }
  },
  getDetailAccount: async (accountId) => {
    try {
      const account = await Account.findById(accountId)
        .populate(STUDENT_ROLE)
        .populate(ADMIN_ROLE)
        .populate(TEACHER_ROLE);
      if (!account) return { code: 404, message: "KHông tìm thấy tài khoản" };
      return { code: 200, data: account[account.role] };
    } catch (error) {
      return { code: 500, message: "Lỗi hệ thống, vui lòng thử lại sau." };
    }
  },
  createAccount: async (body) => {
    const { username, password, email, role, name } = body;

    try {
      const { userSchema } = getSchemaByRole(role);

      const [existUsername, existEmail] = await Promise.all([
        Account.findOne({ username }),
        userSchema.findOne({ email }),
      ]);

      if (existUsername)
        return { code: 401, message: "Tài khoản đã được sử dụng." };
      if (existEmail) return { code: 401, message: "Email đã được sử dụng" };

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newAccount = await Account.create({
        username,
        password: hashedPassword,
        role,
      });

      const newUser = await userSchema.create({
        code: await generateUniqueCodeByRole(role),
        email,
        name,
        account: newAccount._id,
      });

      const res = await Account.findByIdAndUpdate(newAccount._id, {
        $set: { [role]: newUser._id },
      });

      return {
        code: 201,
        message: "Tạo tài khoản thành công",
      };
    } catch (err) {
      console.error(err);
      return { code: 500, message: "Lỗi hệ thống, vui lòng thử lại sau." };
    }
  },
  updateAccountById: async (id, body, requester) => {
    try {
      const isAdmin = requester?.role === ADMIN_ROLE;
      const updates = {};

      if (isAdmin) {
        if (body.role !== undefined) updates.role = body.role;
        if (body.isDelete !== undefined) updates.isDelete = body.isDelete;
      }

      if (body.username !== undefined) updates.username = body.username;

      const account = await Account.findByIdAndUpdate(id, updates, { new: true });
      if (!account) return { code: 404, message: "Không tìm thấy tài khoản" };
      return {
        code: 201,
        message: "Cập nhật tài khoản thành công.",
        data: account,
      };
    } catch (error) {
      console.error(error);
    }
  },
  deleteAccountById: async (id) => {
    try {
      await Promise.all([
        Account.findByIdAndUpdate(id, { isDelete: true }),
        Student.findOneAndUpdate({ account: id }, { isDelete: true }),
      ]);
      return {
        code: 201,
        message: "Xóa tài khoản thành công.",
      };
    } catch (error) {
      console.error(error);
      return {
        code: 500,
        message: "Lỗi hệ thống, vui lòng thử lại sau.",
      };
    }
  },

  changePassword: async ({ accountId, oldPassword, newPassword }) => {
    try {
      const oldPasswordValue =
        typeof oldPassword === "string" ? oldPassword.trim() : "";
      const newPasswordValue =
        typeof newPassword === "string" ? newPassword.trim() : "";

      if (!oldPasswordValue || !newPasswordValue) {
        return { code: 400, message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới." };
      }
      if (newPasswordValue.length < PASSWORD_MIN_LENGTH) {
        return { code: 400, message: "Mật khẩu mới phải có ít nhất 8 ký tự." };
      }
      if (oldPasswordValue === newPasswordValue) {
        return { code: 400, message: "Mật khẩu mới phải khác mật khẩu cũ." };
      }

      const account = await Account.findById(accountId);
      if (!account) throw { code: 404, message: "Tài khoản không tồn tại." };

      const isOldPasswordValid = await bcrypt.compare(
        oldPasswordValue,
        account.password
      );
      if (!isOldPasswordValid)
        return { code: 401, message: "Mật khẩu cũ không đúng." };

      const hashedNewPassword = await bcrypt.hash(newPasswordValue, 10);
      await Account.findByIdAndUpdate(accountId, {
        password: hashedNewPassword,
      });
      return { code: 200, message: "Thay đổi mật khẩu thành công" };
    } catch (error) {
      const code = error.code || 500;
      const message = error.message || "Lỗi server.";
      return { code, message };
    }
  },
};
