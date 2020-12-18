const express = require('express');
const router = express.Router();
const admin = require('../../controllers/admin/admin');
const adminValidators = require('../../validators/admin/adminValidator');


router.post('/login', adminValidators.validateAdminLoginUsername, admin.adminLoginUsername);
router.post('/logout', admin.adminLogout);
router.post('/addAdmin',adminValidators.adminIsLoggedIn,adminValidators.validateadminIsTheMainAdmin,adminValidators.validateAdminInfo, admin.addAdmin );
router.put('/suspendClient',adminValidators.adminIsLoggedIn,admin.adminSuspendClient)


/////////// testing /////////
router.post('/addAdminTesting',adminValidators.validateAdminInfoTest, admin.addAdminTest );

module.exports = router;