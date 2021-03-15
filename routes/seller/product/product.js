const express = require('express');
const router = express.Router();
const product = require('../../../controllers/seller/product/product');
const productVariant = require('../../../controllers/seller/product/productVariant');
const { authenticateSeller } = require('../../../validators/seller/sellerValidator');
const { validateAddProduct } = require('../../../validators/product/productValidator');

router.post('/similar-products', product.getSimilarProducts);
router.post('/more-from-seller', product.getMoreFromSeller);
router.get('/store/:id', product.getStoreProducts);
router.get('/product-variant/:id', productVariant.getVariant);
router.post('/variant', productVariant.createProductVariant);
router.get('/variant/:id', productVariant.getProductVariant);
router.post('/find', product.findProduct);
router.post('/', authenticateSeller, validateAddProduct, product.createProduct);
router.put('/', product.updateProduct);
router.delete('/', product.deleteProduct);

router.get('/:id', product.getProductById);

module.exports = router;