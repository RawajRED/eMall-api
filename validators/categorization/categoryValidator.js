const { check, validationResult } = require('express-validator');
const errors = require('./categoryValidator.json');

exports.validateCategoryCreate = [
    check('name.en')
        .exists().withMessage(errors.name.enExists).bail()
        .isString().withMessage(errors.name.enIsString),
    check('name.ar')
        .exists().withMessage(errors.name.arExists).bail()
        .isString().withMessage(errors.name.arIsString),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            {
                next({status: 422, errors: errors.array()});
            }
        next();
    }
]