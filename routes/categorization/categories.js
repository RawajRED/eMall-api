const express = require('express');
const router = express.Router();
const categories = require('../../controllers/categorization/categories');
const { validateCategoryCreate } = require('../../validators/categorization/categoryValidator');
const cache = require('express-redis-cache')({expire: 3600})

router.get('/', cache.route(), categories.getCategories);
router.post('/multiple', categories.createCategory);
router.post('/search', categories.findCategory);
router.get('/:id', categories.getCategory);
router.post('/', validateCategoryCreate, categories.createCategory);
router.put('/', categories.editCategory);
router.delete('/', categories.deleteCategory);

module.exports = router;