const express = require('express');
const router = express.Router();
const advertisement = require('../controllers/advertisement');
const { authenticateSeller } = require('../validators/seller/sellerValidator');
const cache = require('express-redis-cache')({expire: 3600})

// * Home Ads
router.get('/home', cache.route(), advertisement.getHomeAds);
router.get('/home/current/:page', advertisement.getCurrentHomeAd);
router.get('/home/bid/:page', advertisement.getHighestBidder);
router.post('/home', advertisement.createHomeAd);
router.post('/home/bid', authenticateSeller, advertisement.updateHighestBidder);
router.post('/home/alternate', advertisement.alternateActiveBid);

// * Banner Ads
router.get('/banner', authenticateSeller, advertisement.getOwnBanners);
router.post('/banner', authenticateSeller, advertisement.createBannerAd);
router.put('/banner', authenticateSeller, advertisement.updateBannerAd);

//  * Deal of the Day
router.get('/dealsoftheday', cache.route(), advertisement.getDealsOfTheDay);
router.get('/dealsoftheday/full', cache.route(), advertisement.getFullDealsOfTheDay);
router.get('/dealsoftheday/own', authenticateSeller, advertisement.getOwnDealsOfTheDay);
router.post('/dealsoftheday', authenticateSeller, advertisement.createDealOfTheDay);

// * Featured Products
router.get('/featured-products', cache.route(), advertisement.getFeaturedProducts);

// * Featured Stores
router.get('/featured-stores', cache.route(), advertisement.getFeaturedStores);

// * Main Ads
router.get('/main', advertisement.getMainAds);
router.post('/main', advertisement.createMainAd);

module.exports = router;