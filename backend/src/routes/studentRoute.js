const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { uploadFile } = require("../middlewares/uploadFile");

router.get("/", studentController.getAllStudents);
router.get("/:id", studentController.getDetailStudent);

router.post("/", studentController.addStudent);
router.post("/uploadExcel", uploadFile("file"), studentController.uploadExcel);

router.put("/:id", uploadFile("avatar"), studentController.updateStudent);
router.put("/register/:id", studentController.registerCourse);
router.put("/cancelRegister/:id", studentController.cancelRegisterCourse);

router.delete("/:id", studentController.deleteStudent);

module.exports = router;
