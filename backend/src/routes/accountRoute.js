const express = require("express");
const router = express.Router();

const accountController = require("../controllers/accountController");
const { verifyToken, verifyAdmin } = require("../middlewares/verify");

router.get("/", verifyToken, verifyAdmin, accountController.getAllAccounts);
router.get(
  "/detail/:id",
  verifyToken,
  verifyAdmin,
  accountController.getDetailAccount
);

router.post("/", verifyToken, accountController.createAccount);

router.put("/:id", verifyToken, accountController.updateAccountById);
router.put(
  "/changePassword/:id",
  verifyToken,
  verifyAdmin,
  accountController.changePassword
);

router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  accountController.deleteAccountById
);

module.exports = router;
