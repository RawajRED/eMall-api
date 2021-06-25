const express = require('express');
const router = express.Router();
const admin = require('../../controllers/admin/admin');
const adminValidators = require('../../validators/admin/adminValidator');


router.post('/login', adminValidators.validateAdminLoginEmail, admin.adminLoginEmail);
router.post('/logout', admin.adminLogout);

router.post('/stores', adminValidators.adminIsLoggedIn, admin.getAllStores);
router.post('/stores/applying', adminValidators.adminIsLoggedIn, admin.getApplyingStores);
router.post('/stores/deleted', adminValidators.adminIsLoggedIn, admin.getDeletedStores);
router.post('/stores/approve', adminValidators.adminIsLoggedIn, admin.approveStore);
router.get('/stores/:id', adminValidators.adminIsLoggedIn, admin.getStoreData);
router.delete('/stores/:id', adminValidators.adminIsLoggedIn, admin.deleteStore);
router.put('/stores/revert/:id', adminValidators.adminIsLoggedIn, admin.revertStore);

router.delete('/featured-product', adminValidators.adminIsLoggedIn, admin.removeFeaturedProduct);
router.get('/featured-product', admin.getFeaturedProducts);
router.post('/featured-product', adminValidators.adminIsLoggedIn, admin.addFeaturedProducts);

router.post('/search-products', adminValidators.adminIsLoggedIn, admin.searchProducts);

router.get('/orders/:status', adminValidators.adminIsLoggedIn, admin.getReadyOrders);
router.put('/orders/status', adminValidators.adminIsLoggedIn, admin.changeOrderStatus);
router.post('/orders/fulfill', adminValidators.adminIsLoggedIn, admin.fulfillPayment);
router.delete('/orders/wipe', adminValidators.adminIsLoggedIn, admin.wipeOrders);

router.get('/refresh', adminValidators.refreshToken);
router.get('/', adminValidators.adminVerifyToken);

module.exports = router;