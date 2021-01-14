const express = require('express');
const router = express.Router();
const advertisement = require('../controllers/advertisement');

router.get('/main', advertisement.getMainAds);
router.post('/main', advertisement.createMainAd);

module.exports = router;