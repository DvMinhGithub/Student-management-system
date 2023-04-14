const express = require("express");
const routes = express.Router();

const authRouter = require("./authRoute");
const studentRouter = require("./studentRoute");

routes.use("/api/v1/auth", authRouter);
routes.use("/api/v1/students", studentRouter);

module.exports = routes;
