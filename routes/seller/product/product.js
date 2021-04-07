const express = require('express');
const router = express.Router();
const product = require('../../../controllers/seller/product/product');
const productVariant = require('../../../controllers/seller/product/productVariant');
const { authenticateSeller } = require('../../../validators/seller/sellerValidator');
const { validateAddProduct } = require('../../../validators/product/productValidator');

router.post('/similar-products', product.getSimilarProducts);
router.post('/more-from-seller', product.getMoreFromSeller);
router.get('/deals', product.getDeals);
router.get('/reviews/:product', product.getReviews);

router.get('/store/:id', product.getStoreProducts);
router.get('/product-variant/:id', productVariant.getVariant);
router.post('/variant', authenticateSeller, productVariant.createProductVariant);
router.put('/variant', authenticateSeller, productVariant.updateProductVariant);
router.put('/variant/add', authenticateSeller, productVariant.addProductToVariant);
router.delete('/variant', authenticateSeller, productVariant.removeProductVariant);
router.get('/variant/:product', productVariant.getProductVariants);

router.get('/sms', productVariant.sms);

router.post('/category/', product.findByCategory);
router.post('/subcategory/', product.findBySubcategory);
router.post('/find', product.findProduct);
router.post('/', authenticateSeller, validateAddProduct, product.createProduct);
router.put('/options', authenticateSeller, product.updateProductOptions);
router.put('/options/add-param', authenticateSeller, product.addProductOptionsAddParam);
router.put('/options/update-param', authenticateSeller, product.updateProductOptionsAddParam);
router.put('/', authenticateSeller, validateAddProduct, product.updateProduct);
router.delete('/', product.deleteProduct);

router.get('/:id', product.getProductById);

module.exports = router;