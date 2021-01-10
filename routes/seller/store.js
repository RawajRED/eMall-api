const express = require('express');
const router = express.Router();
const store = require('../../controllers/seller/store');

router.get('/most-popular', store.getMostPopularStores);
router.post('/find-by-category', store.getStoreProductsByCategory);
router.post('/find-by-subcategory', store.getStoreProductsBySubcategory);
router.post('/find-similar-stores', store.getSimilarStores);

module.exports = router;