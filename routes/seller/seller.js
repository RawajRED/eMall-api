const express = require('express');
const router = express.Router();
const seller = require('../../controllers/seller/seller');
const { validateSellerLogin, validateSellerRegister, validateStoreRegister, validateSeller, authenticateSeller } = require('../../validators/seller/sellerValidator');
// const clientValidators = require('../../validators/seller/sellerValidator');

router.post('/register', validateSellerRegister, seller.createStoreAndSellerEmail);
router.post('/login', validateSellerLogin, seller.sellerSignInEmail);
router.post('/login/facebook', seller.sellerSignInFacebook);
router.post('/verify', validateSeller, (req, res) => res.status(200).json({done: true}))

router.put('/store', authenticateSeller, seller.sellerEditStore);

module.exports = router;