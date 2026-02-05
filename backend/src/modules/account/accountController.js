const accountService = require("./accountService");

module.exports = {
  createAccount: async (req, res, next) => {
    try {
      const { code, ...rest } = await accountService.createAccount(req.body);
      return res.json({ ...rest });
    } catch (error) {
      next(error);
    }
  },
  getAllAccounts: async (req, res, next) => {
    try {
      const { data } = await accountService.getAllAccounts();
      return res.json({ data });
    } catch (error) {
      next(error);
    }
  },
  getDetailAccount: async (req, res, next) => {
    try {
      const { data } = await accountService.getDetailAccount(req.params.id);
      return res.json({ data });
    } catch (error) {
      next(error);
    }
  },
  updateAccountById: async (req, res, next) => {
    try {
      const { code, message, data } = await accountService.updateAccountById(
        req.params.id,
        req.body,
        req.account
      );
      return res.status(code).json({ message, data });
    } catch (error) {
      next(error);
    }
  },
  deleteAccountById: async (req, res, next) => {
    try {
      const { code, message } = await accountService.deleteAccountById(
        req.params.id
      );
      res.status(code).json({ message });
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const accountId = req.params.id;
      const { oldPassword, newPassword } = req.body;
      const { code, message } = await accountService.changePassword({
        accountId,
        oldPassword,
        newPassword,
      });
      return res.status(code).json({ message });
    } catch (error) {
      next(error);
    }
  },
};
