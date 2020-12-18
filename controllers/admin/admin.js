const Admin = require('../../models/admin/Admin');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Client = require('../../models/client/Client');

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
                    if(admin.deleted)
                    {
                        return res.json({status:401, message:'Your account has been deactivated'})
                    }
                const token = jwt.sign({admin},process.env.SECRET_KEY_ADMIN, { expiresIn: '1d'});
                next(res.json({status :200, admin, token}))
                }
                else{
                    next({message: 'Incorrect Password', status: 401});
                } })
            }
        else next({status: 404, message: 'Username not found'})
    })
    .catch(err => {next({status: 400, message: 'Username not found'})})
}


exports.adminLogout = (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) { 
        res.json({status:200, success: true, message: 'Logged Out Successfully', token: null });
    } else {
        res.json({ success: false, message: 'Not Logged in' });
    }

}

exports.addAdmin = (req, res, next) => {
    const password = req.body.password;
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if(err)
            next({status: 500, message: 'Internal Server Error'})
        const admin = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            password: hash
        };
        Admin.create(admin)
        .then(resp => resp.toJSON())
        .then(resp => {
            res.json({ status :200,success: true, message: 'New Admin was added successfully' });
        })
        .catch(err =>next({status: 400, message: err}));
    })
};



exports.adminSuspendClient = (req, res, next) => {
    if(req.query._id == undefined)
        return next({status: 403, message: 'Incorrect ID'});
    var id = req.query._id
    Client.findByIdAndUpdate(id, { suspended: "true" },function (err, docs) { 
        if (err){ 
            next({status: 400, message: err})
        } 
        else{ 
            return res.json({status: 'success'})
        } 
    });     
}

exports.adminUnSuspendClient = (req, res, next) => {
    if(req.query._id == undefined)
        return next({status: 403, message: 'Incorrect ID'});
    var id = req.query._id
    Client.findByIdAndUpdate(id, { suspended: "false" },function (err, docs) { 
        if (err){ 
            next({status: 400, message: err})
        } 
        else{ 
            return res.json({status: 'success'})
        } 
    });     
}
exports.viewAdminList = (req, res, next) => {

    Admin.find({mainAdmin:"false"}, function(err, admins) {
        if(err)
        {
            res.json({status: 500, message: 'Internal Server Error'})
        }
        var adminsList = {};
        admins.forEach(function(admin) {
            adminsList[admin._id] = {"Username":admin.username,"Deactivated":admin.deleted};
        });
        res.send({status:200, message: "success", adminsList});  
    });
}


exports.deactivateAdmin = (req, res, next) => {
    if(req.query._id == undefined)
        return next({status: 403, message: 'Incorrect ID'});
    var id = req.query._id
    Admin.findByIdAndUpdate(id, { deleted: "true" },function (err, docs) { 
        if (err){ 
            next({status: 400, message: err})
        } 
        else{            
            return res.json({status: 'success'})
        } 
    });     
}

exports.activateAdmin = (req, res, next) => {
    if(req.query._id == undefined)
        return next({status: 403, message: 'Incorrect ID'});
    var id = req.query._id
    Admin.findByIdAndUpdate(id, { deleted: "false" },function (err, docs) { 
        if (err){ 
            next({status: 400, message: err})
        } 
        else{ 
            return res.json({status: 'success'})
        } 
    });     
}


exports.clientStats = (req, res, next) => {

    Client.find({}, function(err, clients) {
        if(err)
        {
            res.json({status: 500, message: 'Internal Server Error'})
        }
        var suspendedClients = {};
        var activeClients = 0 ;
        var deletedAccounts =0 ;
        clients.forEach(function(client) {
            if(client.deleted === "true") delectedAccounts++;
            else if(client.suspended ===true) suspendedClients[client._id] = {"email":client.email};
            else activeClients++;
        });
        res.send({status:200, message: "success", "Active Clients":activeClients, "Deactivated Accounts":deletedAccounts,suspendedClients});  

    });
}









///////////////// testing /////////////////////////
exports.addAdminTest = (req, res, next) => {
    const password = req.body.password;
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if(err)
            next({status: 500, message: 'Internal Server Error'})
        const admin = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            password: hash,
            mainAdmin: req.body.main
        };
        Admin.create(admin)
        .then(resp => resp.toJSON())
        .then(resp => {
            res.json({ status :200,success: true, message: 'New Admin was added successfully' });
        })
        .catch(err =>next({status: 400, message: err}));
    })
};