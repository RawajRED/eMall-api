const { check, validationResult } = require('express-validator');
const errors = require('./adminValidator.json');
const Admin = require("../../models/admin/Admin");
const jwt = require('jsonwebtoken');


exports.validateAdminLoginUsername = [
    check('username')
        .exists().withMessage('Username should be provided').bail(),
    check('password')
        .exists().withMessage("Password is missing").bail()
        .isString()
        .isLength({min: 8, max: 20}),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            {
                next({status: 422, errors: errors.array()});
            }
        next();
    }
]

exports.adminIsLoggedIn = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    jwt.verify(token, process.env.SECRET_KEY_ADMIN, (err, decoded) => {
        if(err){
            return next({status: 400, message: 'Invalid Token'})
        }
        else{
            req.body.payload = decoded;
            next();
        }
    });
}


exports.validateadminIsTheMainAdmin = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    jwt.verify(token, process.env.SECRET_KEY_ADMIN, (err, decoded) => {
        if(err){
            return next({status: 400, message: 'Invalid Token'})
        }
        else{
            if(decoded.admin.mainAdmin) {
                req.body.payload = decoded;
                next();
            }
            else {
                return next({status: 401, message: 'You are not authorized to take this action'})
            }

        }
    });
}

exports.validateAdminInfo = [
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
        check('username')
            .exists().withMessage("username is missing")
            .isString()
            .isLength({min: 3, max: 30}).withMessage('username should be between 3 and 30 characters')
            .custom((value) => {
                return Admin.findOne({username: value}).then(admin => {
                    if (admin)
                        return Promise.reject('username already in use')
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







    //////////// testing ////////////////////

    exports.validateAdminInfoTest = [
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
        check('username')
            .exists().withMessage("username is missing")
            .isString()
            .isLength({min: 3, max: 30}).withMessage('username should be between 3 and 30 characters')
            .custom((value) => {
                return Admin.findOne({username: value}).then(admin => {
                    if (admin)
                        return Promise.reject('username already in use')
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