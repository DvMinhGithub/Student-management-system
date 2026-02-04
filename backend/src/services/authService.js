const Account = require("../models/accountModel");
const Student = require("../models/studentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getSchemaByRole, generateTokens } = require("../utils");

const getUniqueCode = async () => {
  let currentDate = new Date();
  let year = currentDate.getFullYear().toString().substr(-2);
  let month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  let code = "TK" + year + month;
  const count = await Student.countDocuments({ code: { $regex: "^" + code } });
  let suffix = (count + 1).toString().padStart(3, "0");
  return code + suffix;
};

module.exports = {
  register: async (body) => {
    try {
      const { username, password, email, name } = body;
      const [existingAccountName, existingStudent] = await Promise.all([
        Account.findOne({ username }),
        Student.findOne({ email }),
      ]);

      if (existingAccountName)
        return { code: 401, message: "Tài khoản đã được sử dụng" };

      if (existingStudent)
        return { code: 401, message: "Email đã được sử dụng" };

      const hashedPassword = await bcrypt.hash(password, 10);

      const newAccount = await Account.create({
        username,
        password: hashedPassword,
      });

      const newStudent = await Student.create({
        code: await getUniqueCode(),
        name,
        email,
        account: newAccount._id,
      });

      await Account.findByIdAndUpdate(newAccount._id, {
        $set: { student: newStudent._id },
      });

      return { code: 201, message: "Đăng ký tài khoản thành công" };
    } catch (error) {
      console.error(error);
    }
  },
  login: async (body) => {
    try {
      const { username, password } = body;
      if (!username || !password)
        return { code: 401, message: "Vui lòng nhập tài khoản và mật khẩu" };

      const account = await Account.findOne({ username })
        .populate("admin")
        .populate("teacher")
        .populate("student");
        console.log(account)

      if (!account) return { code: 401, message: "Tài khoản không hợp lệ" };

      const match = await bcrypt.compare(password, account.password);
      if (!match) return { code: 401, message: "Mật khẩu không hợp lệ" };

      const data = {
        accountId: account._id,
        userId: account[account.role]._id,
        role: account.role,
      };
      const { accessToken, refreshToken } = generateTokens(data);
      account.refreshToken = refreshToken;
      await account.save();

      return {
        code: 200,
        message: "Đăng nhập thành công",
        accessToken,
        refreshToken,
        data: account,
      };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Có lỗi xảy ra" };
    }
  },
  refresh: async (body) => {
    try {
      const { refreshToken } = body;
      console.log("🚀 ~ file: authService.js:95 ~ refresh: ~ refreshToken:", refreshToken)

      if (!refreshToken) {
        return {
          code: 401,
          message: "Refresh token is required",
        };
      }

      const refreshTokenDoc = await Account.findOne({
        refreshToken,
      });

      if (!refreshTokenDoc) {
        return {
          code: 401,
          message: "Invalid refresh token",
        };
      }

      const decodedToken = jwt.verify(refreshToken, process.env.JWT_SECRET);

      const { userSchema } = getSchemaByRole(decodedToken.role);

      const user = await userSchema.findById(decodedToken.userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const data = {
        accountId: refreshTokenDoc._id,
        userId: refreshTokenDoc[refreshTokenDoc.role]._id.toString(),
        role: refreshTokenDoc.role,
      };

      const { accessToken, refreshToken: newRefreshToken } =
        generateTokens(data);

      refreshTokenDoc.refreshToken = newRefreshToken;
      await refreshTokenDoc.save();

      return {
        code: 200,
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Có lỗi xảy ra" };
    }
  },
};

