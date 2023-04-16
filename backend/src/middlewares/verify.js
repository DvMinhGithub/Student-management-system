const jwt = require("jsonwebtoken");

module.exports = {
  verifyToken: (req, res, next) => {
    const token = req.headers.authorization;
    if (!token)
      return res.status(401).json({ message: "Khong tìm thấy token" });
    try {
      const decoded = jwt.verify(token.split(" ")[1], "adminStudentManager");
      req.account = decoded;
      next();
    } catch (error) {
      console.error(error.message);
      return res.status(401).json({ message: "Phiên đăng nhập hết hạn" });
    }
  },
  verifyAdmin: (req, res, next) => {
    if (req.account && req.account.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "Truy cập bị cấm" });
    }
  },
};
