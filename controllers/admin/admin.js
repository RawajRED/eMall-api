const Admin = require('../../models/admin/Admin');
const Client = require('../../models/client/Client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');



exports.adminLoginUsername = (req, res, next) => {
    Admin.findOne({Username: req.body.Username})
    .then(resp => resp.toJSON())
    .then(admin => {
        if(admin)
            bcrypt.compare(req.body.password, admin.password, (err, result) => {
                delete admin.password;
                if(err)
                    return next({status: 500, message: 'Internal Server Error, token unverifiable'});
                if(result){
                    const token = jwt.sign({ admin }, req.app.get('secret_key_admin'), { expiresIn: '7d'});
                    return res.json({admin, token})
                }
                else next({message: 'Incorrect Password', status: 401});
            })
        else next({status: 404, message: 'Username not found'})
    })
    .catch(err => next({status: 400, message: 'Username not found'}))
}
