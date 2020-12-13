const { check, validationResult } = require('express-validator');
const errors = require('./clientValidator.json');
const Client = require("../../models/client/Client");

// TODO: Add languages to validation message
exports.validateClientRegister = [
        check('firstName')
            .exists().withMessage(errors.firstNameMissing).bail()
            .isString().withMessage('first name should be a string')
            .isAlphanumeric().withMessage(errors.firstNameAlphanumeric)
            .isLength({min: 3, max: 30}).withMessage(errors.firstNameAlphanumeric),
        check('lastName')
            .exists().withMessage('Last Name is missing').bail()
            .isString()
            .isAlphanumeric().withMessage('Last Name should not contain special characters')
            .isLength({min: 3, max: 30}).withMessage('Last name should be between 3 and 30 characters'),
        check('email')
            .exists().withMessage("Email is missing")
            .isEmail()
            .normalizeEmail()
            .isLength({min: 3, max: 30}).withMessage('Last name should be between 3 and 30 characters')
            .custom((value) => {
                return Client.findOne({email: value}).then(client => {
                    if (client)
                        return Promise.reject('Email already in use')
                })
            }),
        check('password')
            .exists().withMessage("Password is missing").bail()
            .isString()
            .isLength({min: 8, max: 20}),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(422).json({errors: errors.array()});
            next();
            },
    ]