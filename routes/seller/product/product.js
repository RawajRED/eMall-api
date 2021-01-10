const express = require('express');
const router = express.Router();
const product = require('../../../controllers/seller/product/product');

router.get('/:id', product.getProductById);
router.post('/', product.createProduct);
router.delete('/', product.deleteProduct);

module.exports = router;