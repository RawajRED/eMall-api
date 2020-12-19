const express = require('express');
const router = express.Router();
const admin = require('../../controllers/admin/admin');
const adminValidators = require('../../validators/admin/adminValidator');


router.post('/login', adminValidators.validateAdminLoginUsername, admin.adminLoginUsername);
router.post('/logout', admin.adminLogout);



module.exports = router;