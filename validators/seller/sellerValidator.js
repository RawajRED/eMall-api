const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Seller = require("../../models/seller/Seller");

// TODO: Add languages to validation message
exports.validateSellerLogin = [
        check('email')
            .exists().withMessage({en: 'Email should be provided', ar: 'يجب إعطاء البريد الإلكتروني'}).bail()
            .isEmail().withMessage({en: 'Please provide a valid email address', ar: 'يرجى تقديم عنوان بريد إلكتروني صالح'}).bail()
            .normalizeEmail({gmail_remove_dots: false}),
        check('password')
            .exists().withMessage({en: "Password is missing", ar: 'كلمة المرور مفقودة'}).bail()
            .isString()
            .isLength({min: 8, max: 20}).withMessage({en: "Password is too short (8 to 20 characters)", ar: 'كلمة المرور قصيرة جدًا (من 8 إلى 20 حرفًا)'}),

        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty())
                next({status: 422, errors: errors.array()});
            next();
        },
];

exports.validateSellerRegister = [
    
    check('seller.name')
        .exists().withMessage({en: 'Name should be provided', ar: 'يجب تقديم الاسم'}).bail()
        .isString()
        .isLength({min: 3, max: 40}).withMessage({en: 'Name should be between 3 and 40 characters long', ar: 'يجب أن يتراوح الاسم بين 3 و 40 حرفًا'}),
    
    check('seller.email')
        .exists().withMessage({en: 'Email should be provided', ar: 'يجب تقديم البريد الإلكتروني'}).bail()
        .isEmail().withMessage({en: 'Please provide a valid email address', ar: 'يرجى تقديم عنوان بريد إلكتروني صالح'}).bail()
        .normalizeEmail({gmail_remove_dots: false})
        .custom(value => {
            return Seller.findOne({email: value}).then(seller => {
                if (seller)
                    return Promise.reject({en: 'Email already in use', ar: 'البريد الاليكتروني قيد الاستخدام'})
            })
        }),

    check('seller.password')
        .exists().withMessage({en: "Password is missing", ar: 'كلمة المرور مفقودة'}).bail()
        .isString()
        .isLength({min: 8, max: 20}).withMessage({en: "Password is too short (8 to 20 characters)", ar: 'كلمة المرور قصيرة جدًا (من 8 إلى 20 حرفًا)'}),

    check('seller.title')
        .isString()
        .isLength({min: 2, max: 40}).withMessage({en: "Title is too short (2 to 40 characters)", ar: 'العنوان قصير جدًا (من 2 إلى 40 حرفًا)'}),
        

    check('seller.phone')
        .exists().withMessage({en: 'Phone number is missing', ar: 'رقم الهاتف مفقود'}).bail(),
    
    check('store.title')
        .exists().withMessage({en: 'Title should be provided', ar: 'يجب تقديم العنوان'}).bail()
        .isString()
        .isLength({min: 3, max: 40}).withMessage({en: 'Title should be between 3 and 40 characters long', ar: 'يجب أن يتراوح طول العنوان بين 3 و 40 حرفًا'}),
    
    check('store.description')
        .exists().withMessage({en: 'Description should be provided', ar: 'يجب تقديم الوصف'}).bail()
        .isString()
        .isLength({min: 0, max: 300}).withMessage({en: 'Description should be between 200 characters long max', ar: 'يجب أن يكون الوصف ما بين 200 حرف كحد أقصى'}),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            next({status: 422, errors: errors.array()});
        next();
    }
]

exports.validateSeller = [
    check('name')
        .exists().withMessage({en: 'Name should be provided', ar: 'يجب تقديم الاسم'}).bail()
        .isString()
        .isLength({min: 2, max: 40}).withMessage({en: 'Name should be between 2 and 40 characters long', ar: 'يجب أن يتراوح الاسم بين 2 و 40 حرفًا'}),
    
    check('email')
        .exists().withMessage({en: 'Email should be provided', ar: 'يجب تقديم البريد الإلكتروني'}).bail()
        .isEmail().withMessage({en: 'Please provide a valid email address', ar: 'يرجى تقديم عنوان بريد إلكتروني صالح'}).bail()
        .normalizeEmail({gmail_remove_dots: false})
        .custom(value => {
            return Seller.findOne({email: value}).then(seller => {
                if (seller)
                    return Promise.reject({en: 'Email already in use', ar: 'البريد الاليكتروني قيد الاستخدام'})
            })
        }),

    check('password')
        .exists().withMessage({en: "Password is missing", ar: 'كلمة المرور مفقودة'}).bail()
        .isString()
        .isLength({min: 8, max: 30}).withMessage({en: "Password is too short (8 to 30 characters)", ar: 'كلمة المرور قصيرة جدًا (من 8 إلى 30 حرفًا)'}),

    check('title')
        .optional()
        .isString()
        .isLength({min: 2, max: 40}).withMessage({en: "Title is too short (2 to 40 characters)", ar: 'العنوان قصير جدًا (من 2 إلى 40 حرفًا)'}),
        

    check('phone')
        .exists().withMessage({en: 'Phone number is missing', ar: 'رقم الهاتف مفقود'}).bail(),

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