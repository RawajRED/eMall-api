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
            return res.status(500).json({message: 'Internal Server Error'})
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
        .catch(err => res.status(400).json(err))
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
                    return res.status(500).json({message: 'Internal Server Error, token unverifiable'});
                if(result){
                    const token = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
                    return res.json({client, token})
                }
                else return res.status(404).json({message: 'Incorrect Password'});
            })
        else return res.status(404).json({message: 'Email not found'})
    })
    .catch(err => res.status(400).json({message: 'Email not found'}))
}

exports.clientUpdateInfo = (req, res, next) => {
    console.log(req.body.payload)
    Client.updateOne({_id: req.body.payload.client._id}, req.body)
    .then(resp => {
        return res.status(200).json({status: 'success'})
    })
    .catch(err => res.status(404).json({message: err}))
}

exports.getClientCart = (req, res, next) => {
    Cart.findOne({clientId: req.params._id})
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
    .catch(err => res.status(404).json({message: "Couldn't find cart"}))
}

exports.getClientWishlist = (req, res, next) => {
    Wishlist.findOne({clientId: req.params._id})
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
    .catch(err => res.status(404).json({message: "Couldn't find wishlist"}))
}