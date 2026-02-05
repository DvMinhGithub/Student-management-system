const jwt = require("jsonwebtoken");
const { ROLES } = require("../constants/roles");

module.exports = {
  verifyToken: (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Khong tìm thấy token" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.account = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ message: "Phiên đăng nhập hết hạn" });
    }
  },
  verifyAdmin: (req, res, next) => {
    req.account && req.account.role === ROLES.ADMIN
      ? next()
      : res.status(403).json({ message: "Bạn không có quyền truy cập." });
  },
  verifySelfOrAdmin: (req, res, next) => {
    if (!req.account) {
      return res.status(401).json({ message: "Khong tìm thấy token" });
    }
    if (req.account.role === ROLES.ADMIN) return next();
    if (req.account.accountId?.toString() === req.params.id) return next();
    return res.status(403).json({ message: "Bạn không có quyền truy cập." });
  },
};
