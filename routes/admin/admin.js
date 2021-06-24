const express = require('express');
const router = express.Router();
const admin = require('../../controllers/admin/admin');
const adminValidators = require('../../validators/admin/adminValidator');


router.post('/login', adminValidators.validateAdminLoginEmail, admin.adminLoginEmail);
router.post('/logout', admin.adminLogout);

router.get('/stores/applying', adminValidators.adminIsLoggedIn, admin.getApplyingStores);
router.get('/stores/:id', adminValidators.adminIsLoggedIn, admin.getStoreData);

router.post('/featured-product', admin.addFeaturedProduct);
router.delete('/featured-product', admin.removeFeaturedProduct);

router.get('/orders/:status', adminValidators.adminIsLoggedIn, admin.getReadyOrders);
router.put('/orders/status', adminValidators.adminIsLoggedIn, admin.changeOrderStatus);
router.post('/orders/fulfill', adminValidators.adminIsLoggedIn, admin.fulfillPayment);
router.delete('/orders/wipe', adminValidators.adminIsLoggedIn, admin.wipeOrders);

router.get('/refresh', adminValidators.refreshToken);
router.get('/', adminValidators.adminVerifyToken);

module.exports = router;