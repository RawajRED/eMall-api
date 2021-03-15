const express = require('express');
const router = express.Router();
const admin = require('../../controllers/admin/admin');
const adminValidators = require('../../validators/admin/adminValidator');


router.post('/login', adminValidators.validateAdminLoginUsername, admin.adminLoginUsername);
router.post('/logout', admin.adminLogout);

router.post('/featured-product', admin.addFeaturedProduct);
router.delete('/featured-product', admin.removeFeaturedProduct);

router.get('/orders/:status', admin.getReadyOrders);
router.put('/orders/status', admin.changeOrderStatus);
router.post('/orders/fulfill', admin.fulfillPayment);
router.delete('/orders/wipe', admin.wipeOrders);


module.exports = router;