const bcrypt = require('bcrypt');
const Account = require('../models/accountModel');
const Student = require('../models/studentModel');

const getUniqueCode = async () => {
    let currentDate = new Date();
    let year = currentDate.getFullYear().toString().substr(-2);
    let month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    let code = 'TK' + year + month;
    const count = await Account.countDocuments({ code: { $regex: '^' + code } });
    let suffix = (count + 1).toString().padStart(3, '0');
    return code + suffix;
};
module.exports = {
    getAllAccounts: async () => {
        try {
            const accounts = await Account.find({ isDelete: false }).sort('role').populate('student');
            return { data: accounts };
        } catch (error) {
            console.error(error);
        }
    },
    getDetailAccount: async ({ accountId }) => {
        try {
            const account = await Account.findById(accountId).populate('student');
            if (!account) return { code: 404, message: 'KHông tìm thấy tài khoản' };
            return { data: account.student };
        } catch (error) {
            console.error(error);
        }
    },
    updateAccountById: async ({ id, body }) => {
        try {
            const account = await Account.findByIdAndUpdate(id, body, { new: true });
            if (!account) return { code: 404, message: 'Không tìm thấy tài khoản' };
            return {
                code: 201,
                message: 'Cập nhật tài khoản thành công.',
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
                message: 'Xóa tài khoản thành công.',
            };
        } catch (error) {
            console.error(error);
            return {
                code: 500,
                message: 'Lỗi hệ thống, vui lòng thử lại sau.',
            };
        }
    },

    changePassword: async ({ accountId, oldPassword, newPassword }) => {
        try {
            const account = await Account.findById(accountId);
            if (!account) throw { code: 404, message: 'Tài khoản không tồn tại.' };

            const isOldPasswordValid = await bcrypt.compare(oldPassword, account.password);
            if (!isOldPasswordValid) return { code: 401, message: 'Mật khẩu cũ không đúng.' };

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await Account.findByIdAndUpdate(accountId, { password: hashedNewPassword });
            return { code: 200, message: 'Thay đổi mật khẩu thành công' };
        } catch (error) {
            const code = error.code || 500;
            const message = error.message || 'Lỗi server.';
            return { code, message };
        }
    },
};
