const jwt = require("jsonwebtoken");
const { ROLE_MAP } = require("#shared/constants/roles.js");
const config = require("#shared/config/index.js");

const ADMIN_ROLE = ROLE_MAP.ADMIN?.role;
const UNAUTHORIZED_MESSAGE = "Bạn chưa đăng nhập hoặc token không hợp lệ";

const getBearerToken = (authorizationHeader) => {
  if (typeof authorizationHeader !== "string") return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token;
};

const isSelf = (authId, requestId) =>
  typeof requestId === "string" &&
  requestId.length > 0 &&
  authId?.toString() === requestId;

module.exports = {
  verifyToken: (req, res, next) => {
    const token = getBearerToken(req.headers.authorization);
    if (!token)
      return res.status(401).json({ message: UNAUTHORIZED_MESSAGE });

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.account = decoded;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Phiên đăng nhập đã hết hạn" });
      }
      return res.status(401).json({ message: UNAUTHORIZED_MESSAGE });
    }
  },
  verifyAdmin: (req, res, next) => {
    if (!req.account) {
      return res.status(401).json({ message: UNAUTHORIZED_MESSAGE });
    }
    req.account && req.account.role === ADMIN_ROLE
      ? next()
      : res.status(403).json({ message: "Bạn không có quyền truy cập." });
  },
  verifySelfOrAdmin: (req, res, next) => {
    if (!req.account) {
      return res.status(401).json({ message: UNAUTHORIZED_MESSAGE });
    }
    if (req.account.role === ADMIN_ROLE) return next();
    if (isSelf(req.account.accountId, req.params.id)) return next();
    return res.status(403).json({ message: "Bạn không có quyền truy cập." });
  },
  verifySelfByUserOrAdmin: (req, res, next) => {
    if (!req.account) {
      return res.status(401).json({ message: UNAUTHORIZED_MESSAGE });
    }
    if (req.account.role === ADMIN_ROLE) return next();
    if (isSelf(req.account.userId, req.params.id)) return next();
    return res.status(403).json({ message: "Bạn không có quyền truy cập." });
  },
};
