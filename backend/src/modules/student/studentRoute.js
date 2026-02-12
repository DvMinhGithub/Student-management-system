const express = require("express");
const router = express.Router();

const studentController = require("./studentController");
const uploadFile = require("#shared/middlewares/uploadFile.js");
const {
  verifyToken,
  verifyAdmin,
  verifySelfByUserOrAdmin,
} = require("#shared/middlewares/verify.js");

router.get("/", verifyToken, verifyAdmin, studentController.getAllStudents);
router.get(
  "/detail/:id",
  verifyToken,
  verifySelfByUserOrAdmin,
  studentController.getDetailStudent
);

router.post("/", verifyToken, verifyAdmin, studentController.addStudent);
router.post(
  "/uploadExcel",
  verifyToken,
  verifyAdmin,
  uploadFile("file"),
  studentController.uploadExcel
);

router.put(
  "/:id",
  verifyToken,
  verifySelfByUserOrAdmin,
  uploadFile("avatar"),
  studentController.updateStudent
);
router.put(
  "/register/:id",
  verifyToken,
  verifySelfByUserOrAdmin,
  studentController.registerCourse
);
router.put(
  "/cancelRegister/:id",
  verifyToken,
  verifySelfByUserOrAdmin,
  studentController.cancelRegisterCourse
);

router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  studentController.deleteStudent
);

module.exports = router;
