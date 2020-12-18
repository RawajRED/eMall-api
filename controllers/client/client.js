const Client = require('../../models/client/Client');
const Cart = require('../../models/client/Cart');
const Wishlist = require('../../models/client/Wishlist');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.clientRegisterEmail = (req, res, next) => {
    const password = req.body.password;
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if(err)
            next({status: 500, message: 'Internal Server Error'})
        const client = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash
        };
        Client.create(client)
        .then(resp => resp.toJSON())
        .then(resp => {
            delete resp[password];
            res.json(resp);
        })
        .catch(err =>next({status: 400, message: err}));
    })
};

exports.clientLoginEmail = (req, res, next) => {
    Client.findOne({email: req.body.email})
    .then(resp => resp.toJSON())
    .then(client => {
        if(client)
            bcrypt.compare(req.body.password, client.password, (err, result) => {
                delete client.password;
                if(err)
                    return next({status: 500, message: 'Incorrect Password'});
                if(result){
                    if(client.suspended)
                    {
                        return res.json({status:401, message:'Your account has been suspended'})
                    }
                    const token = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
                    return res.json({client, token})
                }
                else next({message: 'Incorrect Password', status: 401});
            })
        else next({status: 404, message: 'Email not found'})
    })
    .catch(err => next({status: 400, message: 'Email not found'}))
}

exports.clientUpdateInfo = (req, res, next) => {
    const client = req.body.payload.client;
    if(client._id !== req._id)
        return next({status: 403, message: 'Incorrect ID'})
    Client.updateOne({_id: req.body.payload.client._id}, req.body)
    .then(resp => {
        return res.json({status: 'success'})
    })
    .catch(err => next({status: 400, message: err}))
}

exports.getClientCart = (req, res, next) => {
    const client = req.body.payload.client;
    if(client._id !== req.params._id)
        return next({status: 403, message: 'Incorrect ID'})
    Cart.findOne({clientId: req.params._id})
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
    .catch(err => next({status: 404, message: "Couldn't find cart"}))
}

exports.getClientWishlist = (req, res, next) => {
    Wishlist.findOne({clientId: req.params._id})
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
    .catch(err => next({status: 404, message: "Couldn't find wishlist"}))
}