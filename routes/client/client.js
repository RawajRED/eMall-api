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
router.post('/forgot-password', client.clientForgotPassword);
router.post('/change-password', clientValidators.validateClientLoginPhone, client.clientChangePassword);
router.post('/change-password-direct', clientValidators.clientIsLoggedIn, client.clientChangePasswordDirect);
router.post('/check-new-phone', clientValidators.clientIsLoggedIn, clientValidators.checkPhone, client.sendOtpToNewPhone);
router.post('/verify-new-phone', clientValidators.clientIsLoggedIn, client.verifyNewPhone);
router.post('/forgot-password/check-otp', client.clientCheckOtp);

// ? PAYMENTS
router.get('/payments', clientValidators.clientIsLoggedIn, client.getPayments);

// ? REFUNDS
router.post('/refund', clientValidators.clientIsLoggedIn, client.requestRefund);

// ? CLIENT GENERAL
router.post('/register', clientValidators.validateClientRegisterPhone, client.clientRegisterPhone); //tested
router.post('/login', clientValidators.validateClientLoginPhone, client.clientLoginPhone); //tested
router.get('/login/token', clientValidators.clientIsLoggedIn, client.clientLoginToken); 
router.get('/login/token/refresh', clientValidators.clientRefreshToken, client.clientRefreshToken); 
router.post('/login/otp', client.clientVerifyOtp); //tested
router.post('/login/facebook', client.clientLoginFacebook);
router.get('/subtotal', clientValidators.clientIsLoggedIn, client.clientSubtotal);
router.get('/total', clientValidators.clientIsLoggedIn, client.clientTotal);
router.put('/', clientValidators.clientIsLoggedIn, client.clientUpdateInfo);

// ! DELETE ACCOUNT
router.delete('/', clientValidators.clientIsLoggedIn, client.clientDeleteAccount);

module.exports = router;