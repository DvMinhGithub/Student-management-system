const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/', accountController.getAllAccounts);
router.get('/detail/:id', accountController.getDetailAccount);
router.put('/:id', accountController.updateAccountById);
router.put('/changePassword/:id', accountController.changePassword);
router.delete('/:id', accountController.deleteAccountById);

module.exports = router;
