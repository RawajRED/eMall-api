const express = require('express');
const router = express.Router();
const advertisement = require('../controllers/advertisement');
const { authenticateSeller } = require('../validators/seller/sellerValidator');

// * Home Ads
router.get('/home', advertisement.getHomeAds);
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
router.get('/dealsoftheday', advertisement.getDealsOfTheDay);
router.get('/dealsoftheday/own', authenticateSeller, advertisement.getOwnDealsOfTheDay);
router.post('/dealsoftheday', authenticateSeller, advertisement.createDealOfTheDay);

// * Featured Products
router.get('/featured-products', advertisement.getFeaturedProducts);

// * Main Ads
router.get('/main', advertisement.getMainAds);
router.post('/main', advertisement.createMainAd);

module.exports = router;