const express = require('express');
const router = express.Router();
const store = require('../../controllers/seller/store');
const { authenticateSeller } = require('../../validators/seller/sellerValidator');

router.get('/most-popular', store.getMostPopularStores);
router.post('/find-by-category', store.getStoreProductsByCategory);
router.post('/find-by-subcategory', store.getStoreProductsBySubcategory);
router.post('/find-similar-stores', store.getSimilarStores);

router.get('/orders', authenticateSeller, store.getOrders);
router.put('/order', authenticateSeller, store.updateOrder);
router.get('/order-products', authenticateSeller, store.getOrderProducts);
router.post('/order-revenue', authenticateSeller, store.getRevenueForOrder)
router.get('/page/:id', store.getStorePage);
router.post('/page', store.createStorePage);
router.put('/page', store.updateStorePage);
router.get('/:id', store.getStore);
router.put('/', store.updateStore);

module.exports = router;