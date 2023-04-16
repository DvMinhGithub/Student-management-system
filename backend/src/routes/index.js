const express = require("express");
const routes = express.Router();

const authRouter = require("./authRoute");
const studentRouter = require("./studentRoute");
const accountRouter = require("./accountRoute");
const courseRouter = require("./courseRoute");
const semesterRouter = require("./semesterRoute");
const teacherRouter = require("./teacherRoute");
const adminRouter = require("./adminRoute");

routes.use("/api/v1/auth", authRouter);
routes.use("/api/v1/students", studentRouter);
routes.use("/api/v1/accounts", accountRouter);
routes.use("/api/v1/courses", courseRouter);
routes.use("/api/v1/semesters", semesterRouter);
routes.use("/api/v1/teachers", teacherRouter);
routes.use("/api/v1/admins", adminRouter);

module.exports = routes;
