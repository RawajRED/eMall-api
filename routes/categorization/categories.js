const express = require('express');
const router = express.Router();
const categories = require('../../controllers/categorization/categories');

/**
 * @swagger
 * /api/categories:
 *  get:
*      summary: Request all category information
*      responses:
*       '200':
*         description: A JSON array containing all the categories
 */
router.get('/', categories.getCategories);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *  get:
*      summary: Request information on one specific category
*      parameters:
*       - in: path
*         name: categoryId
*         schema:
*           type: ObjectId
*         required: true
*      responses:
*       '200':
*         description: A JSON array containing the category that was requested
*       '500':
*         description: Most probably the Category ID parameter has not been specified, or an incorrect one has been placed
 */
router.get('/:id', categories.getCategory);
/**
 * @swagger
 * /api/categories:
 *  post:
 *      summary: Create a new category
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: object
 *                              properties:
 *                                  en:
 *                                      type: string
 *                                  ar:
 *                                      type: string
 *                          description:
 *                               type: object
 *                               properties:
 *                                   en:
 *                                       type: string
 *                                   ar:
 *                                       type: string
 *                          icon:
 *                                type: string
 *                  required:
 *                      -name
 *                      -description
 *                      -icon
 *      responses:
 *          '200':
 *              description: New category has been created successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              name:
 *                                  type: object
 *                                  properties:
 *                                      en:
 *                                          type: string
 *                                      ar:
 *                                          type: string
 *                              description:
 *                                  type: object
 *                                  properties:
 *                                      en:
 *                                          type: string
 *                                      ar:
 *                                          type: string
 *                              icon:
 *                                  type: string
 */
router.post('/', categories.createCategory);
router.delete('/', categories.deleteCategory);

module.exports = router;