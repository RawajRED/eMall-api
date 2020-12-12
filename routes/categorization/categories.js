const express = require('express');
const router = express.Router();
const categories = require('../../controllers/categorization/categories');

/**
 * @swagger
 * /api/categories:
 *  get:
*      description: Request all category information
*      responses:
*       '200':
*         description: A successful response
 */
router.get('/', categories.getCategories);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *  get:
*      description: Request information on one specific category
*      parameters:
*       - in: path
*         name: categoryId
*         schema:
*           type: ObjectId
*         required: true
*      responses:
*       '200':
*         description: A successful response
*       '500':
*         description: Most probably the Category ID parameter has not been specified, or an incorrect one has been placed
 */
router.get('/:id', categories.getCategory);
router.post('/', categories.createCategory);
router.delete('/', categories.deleteCategory);

module.exports = router;