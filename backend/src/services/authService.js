const Account = require("../models/accountModel");
const Student = require("../models/studentModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

      const student = await Student.create({
        code: await getUniqueCode(),
        name,
        email,
        account: newAccount._id,
      });
      await Account.findByIdAndUpdate(newAccount._id, { student: student._id });
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

      const account = await Account.findOneAndUpdate(
        { username },
        { lastLogin: Date.now() }
      ).populate("student");
      if (!account) return { code: 401, message: "Tài khoản không hợp lệ" };

      const match = await bcrypt.compare(password, account.password);
      if (!match) return { code: 401, message: "Mật khẩu không hợp lệ" };

      const token = jwt.sign(
        { accountId: account._id, role: account.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "5m",
        }
      );
      return {
        code: 200,
        message: "Đăng nhập thành công",
        token,
        data: account,
      };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Có lỗi xảy ra" };
    }
  },
};
