const Admin = require('../../models/admin/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');



exports.adminLoginUsername = (req, res, next) => {
    Admin.findOne({username: req.body.username})
    .then(resp => resp.toJSON())
    .then(admin => {
        if(admin){
            bcrypt.compare(req.body.password, admin.password, (err, result) => {
                delete admin.password;
                if(err)
                    return next({status: 500, message: 'Internal Server Error, token unverifiable'});
                if(result){
                const token = jwt.sign({admin},process.env.SECRET_KEY_ADMIN, { expiresIn: '1d'});
                next(res.json({status :200, admin, token}))
                }
                else next({message: 'Incorrect Password', status: 401});})
            }
        else next({status: 404, message: 'Username not found'})
    })
    .catch(err => {console.log(err);next({status: 400, message: 'Username not found'})})
}
exports.adminLogout = (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) { 
        res.json({status:200, success: true, message: 'Logged Out Successfully', token: null });
    } else {
        res.json({ success: false, message: 'Not Logged in' });
    }

}
