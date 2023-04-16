const express = require("express");
const router = express.Router();

const accountController = require("../controllers/accountController");
const { verifyToken } = require("../middlewares/verify");

router.get("/", accountController.getAllAccounts);
router.get("/detail/:id", verifyToken, accountController.getDetailAccount);

router.post("/", accountController.createAccount);

router.put("/:id", accountController.updateAccountById);
router.put("/changePassword/:id", accountController.changePassword);

router.delete("/:id", accountController.deleteAccountById);

module.exports = router;
