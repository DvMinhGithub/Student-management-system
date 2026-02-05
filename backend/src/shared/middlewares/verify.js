const jwt = require("jsonwebtoken");
const { ROLE_MAP } = require("../constants/roles");
const config = require("../config");

const ADMIN_ROLE = ROLE_MAP.ADMIN?.role;

module.exports = {
  verifyToken: (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Khong tìm thấy token" });

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.account = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ message: "Phiên đăng nhập hết hạn" });
    }
  },
  verifyAdmin: (req, res, next) => {
    req.account && req.account.role === ADMIN_ROLE
      ? next()
      : res.status(403).json({ message: "Bạn không có quyền truy cập." });
  },
  verifySelfOrAdmin: (req, res, next) => {
    if (!req.account) {
      return res.status(401).json({ message: "Khong tìm thấy token" });
    }
    if (req.account.role === ADMIN_ROLE) return next();
    if (req.account.accountId?.toString() === req.params.id) return next();
    return res.status(403).json({ message: "Bạn không có quyền truy cập." });
  },
};
