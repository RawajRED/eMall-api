const express = require('express');
const router = express.Router();
const seller = require('../../controllers/seller/seller');
const { validateSellerLogin, validateSellerRegister, validateStoreRegister, validateSeller, authenticateSeller } = require('../../validators/seller/sellerValidator');
// const clientValidators = require('../../validators/seller/sellerValidator');

router.post('/bulk', seller.createSeller);
router.post('/register', validateSellerRegister, seller.createStoreAndSellerEmail);
router.post('/login', validateSellerLogin, seller.sellerSignInEmail);
router.get('/login/token', authenticateSeller, seller.sellerLoginToken);
router.post('/login/facebook', seller.sellerSignInFacebook);
router.post('/verify', validateSeller, (req, res) => res.status(200).json({done: true}))
router.post('/forgot-password', seller.sellerForgotPassword);
router.post('/change-password', seller.sellerChangePassword);
router.post('/forgot-password/check-otp', seller.sellerCheckOtp);

router.get('/members', authenticateSeller, seller.getSellers);
router.put('/members', authenticateSeller, seller.sellerUpdateMember);
router.post('/create-member', authenticateSeller, seller.sellerCreateMember);

router.put('/store', authenticateSeller, seller.sellerEditStore);

module.exports = router;