const express = require('express');
const router = express.Router();
const categories = require('../../controllers/categorization/categories');
const { cache } = require('../../middlewares/redis');
const { validateCategoryCreate } = require('../../validators/categorization/categoryValidator');

router.get('/', cache(8600), categories.getCategories);
router.post('/multiple', categories.createCategory);
router.post('/search', categories.findCategory);
router.get('/:id', categories.getCategory);
router.post('/', validateCategoryCreate, categories.createCategory);
router.put('/', categories.editCategory);
router.delete('/', categories.deleteCategory);

module.exports = router;