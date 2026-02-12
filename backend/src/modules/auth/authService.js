const Account = require("#modules/account/accountModel.js");
const Student = require("#modules/student/studentModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("#shared/config/index.js");
const {
  getSchemaByRole,
  generateTokens,
  generateUniqueCodeByRole,
} = require("#shared/utils/index.js");
const { ROLE_MAP } = require("#shared/constants/roles.js");

const ADMIN_ROLE = ROLE_MAP.ADMIN?.role;
const TEACHER_ROLE = ROLE_MAP.TEACHER?.role;
const STUDENT_ROLE = ROLE_MAP.STUDENT?.role;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{4,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 80;

const asTrimmedString = (value) =>
  typeof value === "string" ? value.trim() : "";

const validateRegisterPayload = ({ username, password, email, name }) => {
  if (!username || !password || !email || !name) {
    return "Vui lòng điền đầy đủ thông tin đăng ký";
  }
  if (!USERNAME_REGEX.test(username)) {
    return "Tài khoản phải từ 4-30 ký tự, chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang";
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Email không hợp lệ";
  }
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    return "Họ tên phải từ 2-80 ký tự";
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return "Mật khẩu phải có ít nhất 8 ký tự";
  }
  return null;
};

const validateLoginPayload = ({ username, password }) => {
  if (!username || !password) {
    return "Vui lòng nhập tài khoản và mật khẩu";
  }
  return null;
};

module.exports = {
  register: async (body) => {
    try {
      const username = asTrimmedString(body?.username);
      const password =
        typeof body?.password === "string" ? body.password : "";
      const email = asTrimmedString(body?.email).toLowerCase();
      const name = asTrimmedString(body?.name);

      const validateMessage = validateRegisterPayload({
        username,
        password,
        email,
        name,
      });
      if (validateMessage) return { code: 400, message: validateMessage };

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
        code: await generateUniqueCodeByRole(STUDENT_ROLE),
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
      return { code: 500, message: "Có lỗi xảy ra" };
    }
  },
  login: async (body) => {
    try {
      const username = asTrimmedString(body?.username);
      const password =
        typeof body?.password === "string" ? body.password : "";
      const validateMessage = validateLoginPayload({ username, password });
      if (validateMessage) return { code: 400, message: validateMessage };

      const account = await Account.findOne({ username })
        .populate(ADMIN_ROLE)
        .populate(TEACHER_ROLE)
        .populate(STUDENT_ROLE);

      if (!account || account.isDelete)
        return { code: 401, message: "Tài khoản không hợp lệ" };

      const match = await bcrypt.compare(password, account.password);
      if (!match) return { code: 401, message: "Mật khẩu không hợp lệ" };

      const profile = account[account.role];
      if (!profile?._id) {
        return { code: 404, message: "Không tìm thấy hồ sơ người dùng" };
      }

      const data = {
        accountId: account._id.toString(),
        userId: profile._id.toString(),
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
      };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Có lỗi xảy ra" };
    }
  },
  getMeProfile: async (authPayload) => {
    try {
      const accountId = authPayload?.accountId;
      const role = authPayload?.role;

      if (!accountId || !role) {
        return { code: 401, message: "Bạn chưa đăng nhập hoặc token không hợp lệ" };
      }

      const account = await Account.findById(accountId)
        .populate(ADMIN_ROLE)
        .populate(TEACHER_ROLE)
        .populate(STUDENT_ROLE);

      if (!account || account.isDelete) {
        return { code: 401, message: "Bạn chưa đăng nhập hoặc token không hợp lệ" };
      }

      const profile = account[role];
      if (!profile?._id || profile?.isDelete) {
        return { code: 404, message: "Không tìm thấy hồ sơ người dùng" };
      }

      const profileData =
        typeof profile.toObject === "function" ? profile.toObject() : profile;

      return {
        code: 200,
        data: {
          ...profileData,
          role,
          accountId: account._id.toString(),
          userId: profile._id.toString(),
        },
      };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Có lỗi xảy ra" };
    }
  },
  refresh: async (body) => {
    try {
      const { refreshToken } = body;
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

      const decodedToken = jwt.verify(refreshToken, config.jwt.secret);

      const { userSchema } = getSchemaByRole(decodedToken.role);

      const user = await userSchema.findById(decodedToken.userId);

      if (!user) {
        return { code: 401, message: "User not found" };
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
