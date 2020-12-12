const express = require('express');
const router = express.Router();
const subcategories = require('../../controllers/categorization/subcategories');

router.get('/', subcategories.getSubcategories);
router.get('/:id', subcategories.getSubcategory);
router.post('/', subcategories.createSubcategory);
router.delete('/', subcategories.deleteSubcategory);

module.exports = router;