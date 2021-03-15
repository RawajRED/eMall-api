const express = require('express');
const router = express.Router();
const store = require('../../controllers/seller/store');
const { authenticateSeller } = require('../../validators/seller/sellerValidator');

router.get('/most-popular', store.getMostPopularStores);
router.post('/find-by-category', store.getStoreProductsByCategory);
router.post('/find-by-subcategory', store.getStoreProductsBySubcategory);
router.post('/find-similar-stores', store.getSimilarStores);

router.get('/orders', authenticateSeller, store.getOrders);
router.put('/order/status', authenticateSeller, store.updateOrderStatus);
router.post('/order-revenue', authenticateSeller, store.getRevenueForOrder)

router.get('/page/:id', store.getStorePage);
router.post('/page', store.createStorePage);
router.put('/page', store.updateStorePage);

router.get('/credit', authenticateSeller, store.getCredit);
router.get('/month-sales', authenticateSeller, store.getMonthlySales);
router.get('/previous-sales', authenticateSeller, store.getPreviousSales);
router.get('/pending-funds', authenticateSeller, store.getPendingFunds);
router.get('/payments', authenticateSeller, store.getPayments);
router.post('/request-withdrawal', authenticateSeller, store.requestWithdrawal);

router.get('/:id', store.getStore);
router.put('/', store.updateStore);

module.exports = router;