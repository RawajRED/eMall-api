const { check, validationResult } = require('express-validator');
const errors = require('./clientValidator.json');
const Client = require("../../models/client/Client");
const jwt = require('jsonwebtoken');

// TODO: Add languages to validation message
exports.validateClientRegisterPhone = [
        check('firstName')
            .exists().withMessage({en: 'First Name should be provided', ar: 'يجب تقديم الاسم الأول'}).bail()
            .isString()
            .isAlphanumeric().withMessage({en: 'First Name should be alphanumeric', ar: 'يجب أن يكون الاسم الأول أبجديًا رقميًا'}).bail()
            .isLength({min: 2, max: 20}).withMessage({en: 'First Name should be between 2 and 20 characters', ar: 'يجب أن يتراوح الاسم الأول بين 2 و 20 حرفًا'}),
        

        check('lastName')
            .exists().withMessage({en: 'Last Name is missing', ar: 'الاسم الأخير مفقود'}).bail()
            .isString()
            .isAlphanumeric().withMessage({en: 'Last Name should not contain special characters', ar: 'يجب ألا يحتوي اسم العائلة على أحرف خاصة'}).bail()
            .isLength({min: 3, max: 30}).withMessage({en: 'Last name should be between 3 and 30 characters', ar: 'يجب أن يتراوح اسم العائلة بين 3 و 30 حرفًا'}),
        

        // check('email')
        //     .exists().withMessage({en: 'Email is missing', ar: 'البريد الإلكتروني مفقود'}).bail()
        //     .isEmail().withMessage({en: 'Invalid Email', ar: 'بريد إلكتروني خاطئ'}).bail()
        //     .normalizeEmail({gmail_remove_dots: false})
        //     .custom((value) => {
        //         return Client.findOne({email: value}).then(client => {
        //             if (client)
        //                 return Promise.reject({en: 'Email already in use', ar: 'البريد الاليكتروني قيد الاستخدام'})
        //         })
        //     }),
        

        check('phone')
            .exists().withMessage({en: 'Phone Number is missing', ar: 'الرقم مفقود'}).bail()
            .isMobilePhone().withMessage({en: 'Invalid Phone Number', ar: 'الرقم خاطئ'}).bail()
            .custom((value) => {
                return Client.findOne({phone: value}).then(client => {
                    if (client)
                        return Promise.reject({en: 'Phone already in use', ar: 'هذا الرقم قيد الاستخدام'})
                })
            }),
        

        check('password')
            .exists().withMessage({en: "Password is missing", ar: 'كلمة المرور مفقودة'}).bail()
            .isString()
            .isLength({min: 8, max: 30}).withMessage({en: 'Password should be between 8 and 30 characters', ar: 'يجب أن تكون كلمة المرور بين 8 و 30 حرفًا'}).bail(),
        

        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty())
                next({status: 422, errors: errors.array()});
            next();
            },
    ];

exports.validateClientLoginPhone = [
    check('phone')
        .exists().withMessage({en: 'Phone Number is missing', ar: 'الرقم مفقود'}).bail()
        .isMobilePhone().withMessage({en: 'Invalid Phone Number', ar: 'الرقم خاطئ'}).bail(),
    check('password')
        .exists().withMessage({en: 'Password is missing', ar: 'كلمة المرور مفقودة'}).bail()
        .isString()
        .isLength({min: 8, max: 20}).withMessage({en: 'Password is invalid (8 to 20 characters)', ar: 'كلمة المرور قصيرة جدًا (من 8 إلى 20 حرفًا)'}),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            next({status: 422, errors: errors.array()});
        else next();
    }
]

exports.checkPhone = [
    check('phone')
    .exists().withMessage({en: 'Phone Number is missing', ar: 'الرقم مفقود'}).bail()
    .isMobilePhone().withMessage({en: 'Invalid Phone Number', ar: 'الرقم خاطئ'}).bail()
    .custom((value) => {
        return Client.findOne({phone: value}).then(client => {
            if (client)
                return Promise.reject({en: 'Phone already in use', ar: 'هذا الرقم قيد الاستخدام'})
        })
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            next({status: 422, errors: errors.array()});
        next();
        },
]

exports.clientIsLoggedIn = (req, res, next) => {
    const token = req.get('Authorization') || req.get('token');
    jwt.verify(token, req.app.get('secret_key'), (err, decoded) => {
        if(err){
            return next({status: 401, message: 'Invalid Token'})
        }
        else{
            req.body.client = decoded.client;
            next();
        }
    });
}

exports.clientRefreshToken = (req, res, next) => {
    const token = req.get('Authorization') || req.get('token');
    jwt.verify(token, req.app.get('secret_key'), (err, decoded) => {
        if(err){
            return next({status: 401, message: 'Invalid Token'})
        }
        else{
            req.body.client = decoded.client;
            next();
        }
    });

}