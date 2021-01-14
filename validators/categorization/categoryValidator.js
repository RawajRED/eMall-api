const { check, validationResult } = require('express-validator');
const errors = require('./categoryValidator.json');

exports.validateCategoryCreate = [
    check('name.en')
        .exists().withMessage(errors.name.enExists).bail()
        .isString().withMessage(errors.name.enIsString),
    check('name.ar')
        .exists().withMessage(errors.name.arExists).bail()
        .isString().withMessage(errors.name.arIsString),
    check('description.en')
        .exists().withMessage(errors.description.enExists).bail()
        .isString().withMessage(errors.description.enIsString)
        .isLength({min: 10, max: 200}).withMessage(errors.description.enLength),
    check('description.ar')
        .exists().withMessage(errors.description.arExists).bail()
        .isString().withMessage(errors.description.arIsString)
        .isLength({min: 10, max: 200}).withMessage(errors.description.arLength),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            {
                next({status: 422, errors: errors.array()});
            }
        next();
    }
]