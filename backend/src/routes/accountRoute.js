const express = require("express");
const router = express.Router();

const accountController = require("../controllers/accountController");
const { verifyToken, verifyAdmin, verifySelfOrAdmin } = require("../middlewares/verify");

router.get("/", verifyToken, verifyAdmin, accountController.getAllAccounts);
router.get(
  "/detail/:id",
  verifyToken,
  verifySelfOrAdmin,
  accountController.getDetailAccount
);

router.post("/", verifyToken, verifyAdmin, accountController.createAccount);

router.put("/:id", verifyToken, verifySelfOrAdmin, accountController.updateAccountById);
router.put(
  "/changePassword/:id",
  verifyToken,
  verifySelfOrAdmin,
  accountController.changePassword
);

router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  accountController.deleteAccountById
);

module.exports = router;
