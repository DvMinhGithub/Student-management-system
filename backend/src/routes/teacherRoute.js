const express = require("express");
const router = express.Router();

const teacherController = require("../controllers/teacherController");
const uploadFile = require("../middlewares/uploadFile");

router.get("/", teacherController.getAllTeachers);

router.post("/", teacherController.addTeacher);
router.post("/uploadExcel", uploadFile("file"), teacherController.uploadExcel);

router.put("/:id", teacherController.updateTeacher);

router.delete("/:id", teacherController.deleteTeacher);

module.exports = router;
