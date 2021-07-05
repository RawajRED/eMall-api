const express = require('express');
const router = express.Router();
const store = require('../../controllers/seller/store');
const { authenticateSeller } = require('../../validators/seller/sellerValidator');
const clientValidators = require('../../validators/client/clientValidator');
const { upload } = require('../../s3');
const { cacheByValue } = require('../../middlewares/redis');

router.get('/most-popular', store.getMostPopularStores);
router.post('/store_ID', store.getStoreId);
router.post('/category_ID', store.getCategory);
router.post('/subcategory_ID', store.getSubCategory);

router.post('/find-by-category', cacheByValue('store', 'category', true, 60), store.getStoreProductsByCategory);
router.post('/find-by-category/full', cacheByValue('store', 'category', true, 60), store.getStoreProductsByCategoryFull);
router.post('/find-by-subcategory', cacheByValue('store', 'subcategory', true, 60), store.getStoreProductsBySubcategory);
router.post('/find-by-subcategory/full', cacheByValue('store', 'subcategory', true, 60), store.getStoreProductsBySubcategoryFull);
router.post('/find-similar-stores', store.getSimilarStores);
router.post('/search', store.findStore);

router.get('/orders', authenticateSeller, store.getOrders);
router.put('/order/status', authenticateSeller, store.updateOrderStatus);
router.post('/order-revenue', authenticateSeller, store.getRevenueForOrder);

router.get('/own-products/:search*?', authenticateSeller, store.getOwnProducts);
router.get('/popular-products', authenticateSeller, store.getPopularProducts)

router.get('/page/:id', store.getStorePage);
router.post('/page/upload', authenticateSeller, upload.single('photo'), store.uploadPageImage);
router.post('/page', store.createStorePage);
router.put('/page', authenticateSeller, store.updateStorePage);

router.post('/views/add', clientValidators.clientIsLoggedIn, store.addView);
router.get('/views', authenticateSeller, store.getViews);

router.get('/reviews/:store', store.getReviews);
router.get('/reviews/overview/:store', store.getReviewsOverview);

router.get('/credit', authenticateSeller, store.getCredit);
router.get('/performance', authenticateSeller, store.getPerformance);
router.get('/month-sales', authenticateSeller, store.getMonthlySales);
router.get('/previous-sales', authenticateSeller, store.getPreviousSales);
router.get('/pending-funds', authenticateSeller, store.getPendingFunds);
router.get('/payments', authenticateSeller, store.getPayments);
router.post('/request-withdrawal', authenticateSeller, store.requestWithdrawal);

router.get('/:id', store.getStore);
router.post('/', store.createStore);
router.put('/', store.updateStore);

module.exports = router;