const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Seller = require("../../models/seller/Seller");

// TODO: Add languages to validation message
exports.validateSellerLogin = [
        check('email')
            .exists().withMessage('Email should be provided').bail()
            .isEmail().withMessage('Please provide a valid email address').bail()
            .normalizeEmail({gmail_remove_dots: false}),
        check('password')
            .exists().withMessage("Password is missing").bail()
            .isString()
            .isLength({min: 8, max: 20}).withMessage("Password is too short (8 to 20 characters)"),

        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty())
                next({status: 422, errors: errors.array()});
            next();
        },
];

exports.validateSellerRegister = [
    
    check('seller.name')
        .exists().withMessage('Name should be provided').bail()
        .isString()
        .isLength({min: 3, max: 40}).withMessage('Name should be between 3 and 40 characters long'),
    
    check('seller.email')
        .exists().withMessage('Email should be provided').bail()
        .isEmail().withMessage('Please provide a valid email address').bail()
        .normalizeEmail({gmail_remove_dots: false})
        .custom(value => {
            return Seller.findOne({email: value}).then(seller => {
                if (seller)
                    return Promise.reject('Email already in use')
            })
        }),

    check('seller.password')
        .exists().withMessage("Password is missing").bail()
        .isString()
        .isLength({min: 8, max: 20}).withMessage("Password is too short (8 to 20 characters)"),

    check('seller.title')
        .isString()
        .isLength({min: 2, max: 40}).withMessage("Title is too short (2 to 40 characters)"),
        

    check('seller.phone')
        .exists().withMessage('Phone number is missing').bail(),
    
    check('store.title')
        .exists().withMessage('Title should be provided').bail()
        .isString()
        .isLength({min: 3, max: 40}).withMessage('Title should be between 3 and 40 characters long'),
    
    check('store.description')
        .exists().withMessage('Description should be provided').bail()
        .isString()
        .isLength({min: 0, max: 300}).withMessage('Description should be between 200 characters long max'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            next({status: 422, errors: errors.array()});
        next();
    }
]

exports.validateSeller = [
    check('name')
        .exists().withMessage('Name should be provided').bail()
        .isString()
        .isLength({min: 2, max: 40}).withMessage('Name should be between 2 and 40 characters long'),
    
    check('email')
        .exists().withMessage('Email should be provided').bail()
        .isEmail().withMessage('Please provide a valid email address').bail()
        .normalizeEmail({gmail_remove_dots: false})
        .custom(value => {
            return Seller.findOne({email: value}).then(seller => {
                if (seller)
                    return Promise.reject('Email already in use')
            })
        }),

    check('password')
        .exists().withMessage("Password is missing").bail()
        .isString()
        .isLength({min: 8, max: 30}).withMessage("Password is too short (8 to 30 characters)"),

    check('title')
        .optional()
        .isString()
        .isLength({min: 2, max: 40}).withMessage("Title is too short (2 to 40 characters)"),
        

    check('phone')
        .exists().withMessage('Phone number is missing').bail(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            next({status: 422, errors: errors.array()});
        next();
    }

]

exports.authenticateSeller = (req, res, next) => {
    const token = req.get('token') || req.get('Authorization');
    jwt.verify(token, req.app.get('secret_key'), (err, decoded) => {
        if(err)
            return next({status: err.status, message: err.message})
        req.body.store = decoded.seller.store;
        delete decoded.seller.store;
        req.body.seller = decoded.seller;
        next();
    })
}

exports.sellerRefreshToken = (req, res, next) => {
    const token = req.get('token') || req.get('Authorization');
    jwt.verify(token, req.app.get('secret_key'), (err, decoded) => {
        if(err){
            return next({status: 400, message: 'Invalid Token'})
        }
        else{
            req.body.store = decoded.seller.store;
            delete decoded.seller.store;
            req.body.seller = decoded.seller;
            next();
        }
    });

}