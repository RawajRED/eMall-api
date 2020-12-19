const { check, validationResult } = require('express-validator');
const errors = require('./clientValidator.json');
const Client = require("../../models/client/Client");
const jwt = require('jsonwebtoken');

// TODO: Add languages to validation message
exports.validateClientRegisterEmail = [
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
                next({status: 422, errors: errors.array()});
            next();
            },
    ];

exports.validateClientLoginEmail = [
    check('email')
        .exists().withMessage('Email should be provided').bail()
        .isEmail().withMessage('Email format is incorrect').bail(),
    check('password')
        .exists().withMessage("Password is missing").bail()
        .isString()
        .isLength({min: 8, max: 20}).withMessage("Password is too short (8 to 20 characters)"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            next({status: 422, errors: errors.array()});
        else next();
    }
]

exports.clientIsLoggedIn = (req, res, next) => {
    const token = req.get('token');
    jwt.verify(token, req.app.get('secret_key'), (err, decoded) => {
        if(err){
            return next({status: 400, message: 'Invalid Token'})
        }
        else{
            req.body.payload = decoded;
            next();
        }
    });
}