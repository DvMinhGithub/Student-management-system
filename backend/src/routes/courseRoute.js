const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const uploadFile = require("../middlewares/uploadFile");

router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseByStudentId);

router.post("/", courseController.createCourse);
router.post("/uploadExcel", uploadFile("file"), courseController.uploadExcel);

router.put("/:id", courseController.updateCourseById);

router.delete("/:id", courseController.deleteCourseById);
module.exports = router;
