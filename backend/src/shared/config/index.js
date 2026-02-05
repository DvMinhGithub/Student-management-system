const parsePort = (value) => {
  const port = Number(value);
  return Number.isFinite(port) && port > 0 ? port : 8080;
};

const port = parsePort(process.env.PORT);

module.exports = {
  env: process.env.NODE_ENV || "development",
  port,
  mongodbUri: process.env.MONGODB_URI,
  baseUrl: process.env.BASE_URL || `http://localhost:${port}`,
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpires: process.env.JWT_ACCESS_TOKEN_EXPIRES,
    refreshExpires: process.env.JWT_REFRESH_TOKEN_EXPIRES,
  },
};
