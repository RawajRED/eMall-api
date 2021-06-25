const { check, validationResult } = require('express-validator');
const errors = require('./adminValidator.json');
const Admin = require("../../models/admin/Admin");
const jwt = require('jsonwebtoken');


exports.validateAdminLoginEmail = [
    check('email')
        .exists().withMessage('Email should be provided').bail()
        .isEmail().withMessage('Email format is incorrect').bail()
        .normalizeEmail({gmail_remove_dots: false}),
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

exports.adminVerifyToken = (req, res, next) => {
    const token = req.get('token');
    jwt.verify(token, process.env.SECRET_KEY_ADMIN, (err, decoded) => {
        if(err){
            return res.sendStatus(401);
        }
        else{
            res.json({admin: decoded.admin});
        }
    });
}

exports.adminIsLoggedIn = (req, res, next) => {
    const token = req.get('token');
    jwt.verify(token, process.env.SECRET_KEY_ADMIN, (err, decoded) => {
        if(err){
            return res.sendStatus(401);
        }
        else{
            next();
        }
    });
}

exports.refreshToken = (req, res, next) => {
    const token = req.get('token');
    jwt.verify(token, process.env.SECRET_KEY_ADMIN, (err, decoded) => {
        if(err){
            return res.sendStatus(401);
        }
        else{
            Admin.findOne({_id: decoded.admin._id})
            .then(admin => {
                const accessToken = jwt.sign({admin}, process.env.SECRET_KEY_ADMIN, { expiresIn: '3h'});
                res.json({accessToken, admin});
            })
        }
    });
}