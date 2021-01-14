const express = require('express');
const router = express.Router();
const product = require('../../../controllers/seller/product/product');
const productVariant = require('../../../controllers/seller/product/productVariant');

router.post('/similar-products', product.getSimilarProducts);
router.post('/more-from-seller', product.getMoreFromSeller);
router.post('/variant', productVariant.createProductVariant);
router.get('/variant/:id', productVariant.getProductVariant);
router.post('/', product.createProduct);
router.put('/', product.updateProduct);
router.delete('/', product.deleteProduct);

router.get('/:id', product.getProductById);

module.exports = router;