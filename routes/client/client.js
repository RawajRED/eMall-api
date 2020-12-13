const express = require('express');
const router = express.Router();
const client = require('../../controllers/client/client');
const clientValidators = require('../../validators/client/clientValidator');

router.post('/', clientValidators.validateClientRegister, client.clientRegisterEmail);
router.post('/login', client.clientLoginEmail);
router.get('/cart/:_id', client.getClientCart);
router.get('/wishlist/:_id', client.getClientWishlist);

module.exports = router;