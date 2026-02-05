const express = require("express");
const routes = express.Router();

const authRouter = require("./auth/authRoute");
const studentRouter = require("./student/studentRoute");
const accountRouter = require("./account/accountRoute");
const courseRouter = require("./course/courseRoute");
const semesterRouter = require("./semester/semesterRoute");
const teacherRouter = require("./teacher/teacherRoute");
const adminRouter = require("./admin/adminRoute");

routes.use("/api/v1/auth", authRouter);
routes.use("/api/v1/students", studentRouter);
routes.use("/api/v1/accounts", accountRouter);
routes.use("/api/v1/courses", courseRouter);
routes.use("/api/v1/semesters", semesterRouter);
routes.use("/api/v1/teachers", teacherRouter);
routes.use("/api/v1/admins", adminRouter);

module.exports = routes;
