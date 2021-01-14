const express = require('express');
const router = express.Router();
const categories = require('../../controllers/categorization/categories');
const { validateCategoryCreate } = require('../../validators/categorization/categoryValidator');

router.get('/', categories.getCategories);
router.get('/:id', categories.getCategory);
router.post('/', validateCategoryCreate, categories.createCategory);
router.put('/', categories.editCategory);
router.delete('/', categories.deleteCategory);

module.exports = router;