const express = require('express');
const router = express.Router();
const subcategories = require('../../controllers/categorization/subcategories');

router.get('/filters/:subcategory', subcategories.getFilters);
router.get('/filters', subcategories.getAllFilters);
router.post('/filters', subcategories.createFilter);

router.get('/', subcategories.getSubcategories);
router.get('/find-by-category/:_id', subcategories.getSubcategoriesByCategory);
router.get('/:id', subcategories.getSubcategory);
router.post('/', subcategories.createSubcategory);
router.put('/', subcategories.editSubcategory);
router.delete('/', subcategories.deleteSubcategory);


module.exports = router;