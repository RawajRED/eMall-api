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
    const token = req.get('token');
    jwt.verify(token, "%]dh^u2))d]v)w{d*IGj6S79h~tr|-O!y~_/8g=(UZ}OJKm!|fl6.$3F(827Zw<", (err, decoded) => {
        if(err){
            return next({status: 400, message: 'Invalid Token'})
        }
        else{
            req.body.payload = decoded;
            next();
        }
    });
}