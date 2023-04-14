const express = require("express");
const routes = express.Router();

const authRouter = require("./authRoute");
const studentRouter = require("./studentRoute");
const accountRouter = require("./accountRoute");


routes.use("/api/v1/auth", authRouter);
routes.use("/api/v1/students", studentRouter);
routes.use("/api/v1/accounts", accountRouter);

module.exports = routes;
