const express = require('express');
const router = express.Router();
const product = require('../../../controllers/seller/product/product');
const productVariant = require('../../../controllers/seller/product/productVariant');
const { authenticateSeller } = require('../../../validators/seller/sellerValidator');
const { validateAddProduct } = require('../../../validators/product/productValidator');
const { cacheByValue, cache } = require('../../../middlewares/redis');

router.post('/similar-products', product.getSimilarProducts);
router.post('/more-from-seller', product.getMoreFromSeller);
router.get('/deals', cache(180), product.getDeals);
router.get('/reviews/:product', product.getReviews);

router.get('/store/:id',  product.getStoreProducts);
router.get('/product-variant/:id', productVariant.getVariant);
router.post('/variant', authenticateSeller, productVariant.createProductVariant);
router.put('/variant', authenticateSeller, productVariant.updateProductVariant);
router.put('/variant/add', authenticateSeller, productVariant.addProductToVariant);
router.delete('/variant', authenticateSeller, productVariant.removeProductVariant);
router.get('/variant/:product', productVariant.getProductVariants);

router.post('/sms', productVariant.sms);

router.post('/category/full', product.findByCategoryFull);
router.post('/category/', product.findByCategory);
router.post('/subcategory/full', product.findBySubcategoryFull);
router.post('/subcategory/', product.findBySubcategory);
router.post('/search', product.findProduct);
router.post('/bulk', product.createProductsBulk);
router.post('/', authenticateSeller, validateAddProduct, product.createProduct);
router.put('/options', authenticateSeller, product.updateProductOptions);
router.put('/options/add-param', authenticateSeller, product.addProductOptionsAddParam);
router.put('/options/update-param', authenticateSeller, product.updateProductOptionsAddParam);
router.put('/', authenticateSeller, validateAddProduct, product.updateProduct);
router.delete('/', product.deleteProduct);

router.get('/:id', cacheByValue('product', 'id', false, 1000),product.getProductById);

module.exports = router;