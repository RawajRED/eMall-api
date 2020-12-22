const express = require('express');
const router = express.Router();
const seller = require('../../controllers/seller/seller');
const { validateSellerLogin, validateSellerRegister } = require('../../validators/seller/sellerValidator');
// const clientValidators = require('../../validators/seller/sellerValidator');

router.post('/register', validateSellerRegister, seller.createStoreAndSellerEmail);
router.post('/login', validateSellerLogin, seller.sellerSignInEmail);

module.exports = router;