const express = require('express');
const router = express.Router();
const client = require('../../controllers/client/client');
const clientValidators = require('../../validators/client/clientValidator');


// ? CART
router.get('/cart', clientValidators.clientIsLoggedIn, client.getClientCart);
router.post('/cart', clientValidators.clientIsLoggedIn, client.addToCart);
router.put('/cart', clientValidators.clientIsLoggedIn, client.updateCart);
router.delete('/cart', clientValidators.clientIsLoggedIn, client.removeFromCart)


// ? WISHLIST
router.get('/wishlist', clientValidators.clientIsLoggedIn, client.getClientWishlist);
router.post('/wishlist', clientValidators.clientIsLoggedIn, client.addToWishlist);
router.delete('/wishlist', clientValidators.clientIsLoggedIn, client.removeFromWishlist)

// ? ORDERS
router.get('/orders', clientValidators.clientIsLoggedIn, client.getOrders)
router.get('/place-order', clientValidators.clientIsLoggedIn, client.placeOrder);
router.put('/cancel-order', clientValidators.clientIsLoggedIn, client.cancelOrder);
router.get('/order-products/:code', clientValidators.clientIsLoggedIn, client.getOrderProducts);


// ? REVIEWS
router.post('/product-review', clientValidators.clientIsLoggedIn, client.leaveProductReview);
router.post('/store-review', clientValidators.clientIsLoggedIn, client.leaveStoreReview);

// ? PROFILE
router.get('/profile', clientValidators.clientIsLoggedIn, client.getProfile);
router.put('/profile', clientValidators.clientIsLoggedIn, client.updateProfile);

// ? CLIENT GENERAL
router.post('/register', clientValidators.validateClientRegisterEmail, client.clientRegisterEmail);
router.post('/login', clientValidators.validateClientLoginEmail, client.clientLoginEmail);
router.get('/login/token', clientValidators.clientIsLoggedIn, client.clientLoginToken);
router.post('/login/otp', client.clientVerifyOtp);
router.post('/login/facebook', client.clientLoginFacebook);
router.get('/subtotal', clientValidators.clientIsLoggedIn, client.clientSubtotal);
router.get('/total', clientValidators.clientIsLoggedIn, client.clientTotal);
router.put('/', clientValidators.clientIsLoggedIn, client.clientUpdateInfo);

// ! DELETE ACCOUNT
router.delete('/', clientValidators.clientIsLoggedIn, client.clientDeleteAccount);

module.exports = router;