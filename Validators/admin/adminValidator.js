const { check, validationResult } = require('express-validator');
const errors = require('./adminValidator.json');
const Admin = require("../../models/admin/Admin");
const jwt = require('jsonwebtoken');


exports.validateClientLoginEmail = [
    check('username')
        .exists().withMessage('Username should be provided').bail()
        .isEmail()
        .normalizeEmail(),
    check('password')
        .exists().withMessage("Password is missing").bail()
        .isString()
        .isLength({min: 8, max: 20}),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            next({status: 422, errors: errors.array()});
        next();
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