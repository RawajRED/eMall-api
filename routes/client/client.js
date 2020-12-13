const express = require('express');
const router = express.Router();
const client = require('../../controllers/client/client');
const clientValidators = require('../../validators/client/clientValidator');

router.post('/', clientValidators.validateClientRegisterEmail, client.clientRegisterEmail);
router.post('/login', clientValidators.validateClientLoginEmail, client.clientLoginEmail);
router.get('/cart/:_id', clientValidators.clientIsLoggedIn, client.getClientCart);
router.get('/wishlist/:_id', clientValidators.clientIsLoggedIn, client.getClientWishlist);

module.exports = router;