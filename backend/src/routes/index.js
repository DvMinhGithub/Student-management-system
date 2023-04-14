const express = require("express");
const routes = express.Router();

const authRouter = require("./authRoute");

routes.use("/api/v1/auth", authRouter);

module.exports = routes;
