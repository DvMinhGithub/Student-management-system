const express = require("express");
const router = express.Router();

const studentController = require("./studentController");
const uploadFile = require("../../shared/middlewares/uploadFile");
const { verifyToken, verifyAdmin } = require("../../shared/middlewares/verify");

router.get("/", verifyToken, verifyAdmin, studentController.getAllStudents);
router.get(
  "/detail/:id",
  verifyToken,
  verifyAdmin,
  studentController.getDetailStudent
);

router.post("/", verifyToken, verifyAdmin, studentController.addStudent);
router.post(
  "/uploadExcel",
  uploadFile("file"),
  verifyToken,
  verifyAdmin,
  studentController.uploadExcel
);

router.put(
  "/:id",
  uploadFile("avatar"),
  verifyToken,
  studentController.updateStudent
);
router.put("/register/:id", verifyToken, studentController.registerCourse);
router.put(
  "/cancelRegister/:id",
  verifyToken,
  studentController.cancelRegisterCourse
);

router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  studentController.deleteStudent
);

module.exports = router;
