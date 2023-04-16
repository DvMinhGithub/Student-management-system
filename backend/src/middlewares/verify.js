const jwt = require("jsonwebtoken");

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
      return res.status(401).json({ message: "Phiên đăng nhập hết hạn" });
    }
  },
  verifyAdmin: (req, res, next) => {
    req.account && req.account.role === "admin"
      ? next()
      : res.status(403).json({ message: "Bạn không có quyền truy cập." });
  },
};
