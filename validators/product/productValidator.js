const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Seller = require("../../models/seller/Seller");

// TODO: Add languages to validation message
exports.validateAddProduct = [
        check('product.title.en')
            .notEmpty().withMessage('Please enter an English title').bail()
            .isString().withMessage('Invalid title type').bail(),
        check('product.title.ar')
            .notEmpty().withMessage('Please enter an Arabic title').bail()
            .isString().withMessage('Invalid title type').bail(),
        check('product.description.en')
            .optional({nullable: true})
            .isString().withMessage('Invalid description type').bail(),
        check('product.description.ar')
            .optional({nullable: true})
            .isString().withMessage('Invalid description type').bail(),
        check('product.category')
            .not().isEmpty().withMessage('Please select a category').bail()
            .isMongoId().withMessage('Invalid category type').bail(),
        check('product.subcategory')
            .notEmpty().withMessage('Please select a category').bail()
            .isMongoId().withMessage('Invalid subcategory type').bail(),
        check('product.filter')
            .notEmpty().withMessage('Please select a filter').bail()
            .isMongoId().withMessage('Invalid filter type').bail(),
        check('product.stock')
            .notEmpty().withMessage('Please enter a valid stock number').bail()
            .isString().withMessage('Invalid stock type').bail(),
        check('product.price')
            .notEmpty().withMessage('Please enter a valid price number').bail()
            .isString().withMessage('Invalid price type').bail(),

        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty())
                next({status: 422, errors: errors.array()});
            next();
        },
];
