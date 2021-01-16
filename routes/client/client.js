const express = require('express');
const router = express.Router();
const client = require('../../controllers/client/client');
const clientValidators = require('../../validators/client/clientValidator');

router.post('/register', clientValidators.validateClientRegisterEmail, client.clientRegisterEmail);
router.post('/login', clientValidators.validateClientLoginEmail, client.clientLoginEmail);
router.post('/login/otp', client.clientVerifyOtp);
router.post('/login/facebook', client.clientLoginFacebook);
router.post('/product-review', clientValidators.clientIsLoggedIn, client.leaveProductReview);
router.post('/store-review', clientValidators.clientIsLoggedIn, client.leaveStoreReview);
router.put('/', clientValidators.clientIsLoggedIn, client.clientUpdateInfo);
router.get('/cart/:_id', clientValidators.clientIsLoggedIn, client.getClientCart);
router.get('/wishlist/:_id', clientValidators.clientIsLoggedIn, client.getClientWishlist);

module.exports = router;