const express = require('express');
const router = express.Router();
const subcategories = require('../../controllers/categorization/subcategories');
const { cacheByValue } = require('../../middlewares/redis');
const cache = require('express-redis-cache')({host:'redis',port:6379,expire: 3600})

router.get('/filters/:subcategory', subcategories.getFilters);
router.get('/filters', cache.route(), subcategories.getAllFilters);
router.post('/filters', subcategories.createFilter);

router.get('/', cache.route(), subcategories.getSubcategories);
router.get('/find-by-category/:_id', cacheByValue('category', '_id', false, 3600), subcategories.getSubcategoriesByCategory);
router.post('/search', subcategories.findSubcategory);
router.get('/:id', subcategories.getSubcategory);
router.post('/', subcategories.createSubcategory);
router.put('/', subcategories.editSubcategory);
router.delete('/', subcategories.deleteSubcategory);


module.exports = router;