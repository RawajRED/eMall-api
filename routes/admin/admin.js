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
router.get('/stores/credit/:id', adminValidators.adminIsLoggedIn, admin.addPendingCredit);
router.get('/stores/:id', adminValidators.adminIsLoggedIn, admin.getStoreData);
router.delete('/stores/:id', adminValidators.adminIsLoggedIn, admin.deleteStore);
router.put('/stores/revert/:id', adminValidators.adminIsLoggedIn, admin.revertStore);

router.delete('/featured-product', adminValidators.adminIsLoggedIn, admin.removeFeaturedProduct);
router.get('/featured-product', admin.getFeaturedProducts);
router.post('/featured-product', adminValidators.adminIsLoggedIn, admin.addFeaturedProducts);

router.delete('/featured-store', adminValidators.adminIsLoggedIn, admin.removeFeaturedStores);
router.get('/featured-store', admin.getFeaturedStores);
router.post('/featured-store', adminValidators.adminIsLoggedIn, admin.addFeaturedStores);

router.post('/search-products', adminValidators.adminIsLoggedIn, admin.searchProducts);

router.put('/orders/status', adminValidators.adminIsLoggedIn, admin.changeOrderStatus);
router.get('/orders/status/:status', adminValidators.adminIsLoggedIn, admin.getReadyOrders);
router.post('/orders/fulfill', adminValidators.adminIsLoggedIn, admin.fulfillPayment);
router.delete('/orders/wipe', adminValidators.adminIsLoggedIn, admin.wipeOrders);
router.get('/orders/:id', adminValidators.adminIsLoggedIn, admin.getFullOrder);

router.put('/store-order/status/:id', adminValidators.adminIsLoggedIn, admin.changeStoreOrderStatus)

router.get('/refunds/:status', adminValidators.adminIsLoggedIn, admin.getRefunds);
router.put('/refunds/confirm', adminValidators.adminIsLoggedIn, admin.confirmRefund);

router.post('/variables', admin.changeVariables);
router.post('/cities', admin.addCity);
router.put('/cities', admin.updateCity);
router.post('/governates', admin.addGovernate);
router.put('/governates', admin.updateGovernate);

router.get('/refresh', adminValidators.refreshToken);
router.post('/', adminValidators.adminIsLoggedIn, admin.createNewAdmin);
router.get('/', adminValidators.adminVerifyToken);


// finance
router.post('/finance/pending',adminValidators.adminIsLoggedIn, admin.getPendingFunds);
router.get('/finance/pendingFull', adminValidators.adminIsLoggedIn,admin.getPendingFundsFull);
router.post('/finance/paid',adminValidators.adminIsLoggedIn, admin.getPaidFunds);
router.get('/finance/paidFull', adminValidators.adminIsLoggedIn,admin.getPaidFundsFull);
router.post('/finance/funds',adminValidators.adminIsLoggedIn, admin.getFunds);
router.get('/finance/fundsFull',adminValidators.adminIsLoggedIn, admin.getFundsFull);

router.get('/finance/store/:id',adminValidators.adminIsLoggedIn, admin.getStoreFunds);
router.get('/finance/store/withdraws/:id',adminValidators.adminIsLoggedIn, admin.getStoreWithdraws)

router.get('/finance/withdraws',adminValidators.adminIsLoggedIn, admin.getWithdraws)
router.post('/finance/fulfill-withdraw',adminValidators.adminIsLoggedIn, admin.fulfillWithdrawal)



module.exports = router;