const express = require("express");
const router = express.Router();

const semesterController = require("../controllers/semesterController");
const { verifyToken, verifyAdmin } = require("../middlewares/verify");

router.get("/", verifyToken, semesterController.getSemesters);
router.get(
  "/:id",
  verifyToken,
  semesterController.getSemesterById
);

router.post("/", verifyToken, verifyAdmin, semesterController.createSemester);

router.put("/:id", verifyToken, verifyAdmin, semesterController.updateSemester);

router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  semesterController.deleteSemester
);

module.exports = router;
