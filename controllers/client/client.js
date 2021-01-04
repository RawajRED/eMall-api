const Client = require('../../models/client/Client');
const Cart = require('../../models/client/Cart');
const Wishlist = require('../../models/client/Wishlist');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendMail = require('../../sendgrid').sendMail;

exports.clientRegisterEmail = (req, res, next) => {
    console.log(req.body);
    const password = req.body.password;
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if(err)
            return next({status: 500, message: 'Internal Server Error'})
        const otp = 'ABCDE';
        const client = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash,
            otp
        };
        Client.create(client)
        .then(resp => resp.toJSON())
        .then(resp => {
            // sendMail({
            //     mail: client.email,
            //     subject: 'Please Verify Your Email',
            //     text: `Verify your email with the code ${otp}`,
            //     html: `<p>Verify your email with the code <strong>${otp}</strong></p>`
            // })
            // .then(() => {
                delete resp['password'];
                delete resp['otp'];
                return res.json(resp);
            // });
        })
        .catch(err =>next({status: 400, message: err}));
    })
};

exports.clientLoginFacebook = (req, res, next) => {
    // Check if there's a client registered with this Facebook ID
    Client.findOne({facebookId: req.body.id})
    .then(resp => {
        if(resp)
            return resp.toJSON()
        else {
            // Check if client is registered with email and link
            Client.findOneAndUpdate({email: req.body.email}, {facebookId: req.body.id, verified: true}, { new: true })
            .then(resp => {
                let name = req.body.name.split(" ");
                name = name.length > 1 ? {firstName: name[0], lastName: name[1]} : {firstName: name[0], lastName: ''}
                if(resp)
                    return resp.toJSON();
                else
                    Client.create({
                        email: req.body.email,
                        facebookId: req.body.id,
                        image: req.body.picture.data.url,
                        verified: true,
                        ...name
                    })
                    .then(resp => resp.toJSON())
                    .then(resp => {
                        const token = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
                        return res.json({client: resp, token});
                    });
            })
            .then(client => {
                const token = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
                return res.json({client, token});
            })
            .catch(err => console.log(err))

        }})
    .then(client => {
        if(client){
            const token = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
            return res.json({client, token})
        }
    })
}

exports.clientLoginEmail = (req, res, next) => {
    Client.findOne({email: req.body.email})
    .then(resp => resp.toJSON())
    .then(client => {
        if(client)
            bcrypt.compare(req.body.password, client.password, (err, result) => {
                delete client.password;
                if(err)
                    return next({status: 500, message: 'Incorrect Email or Password'});
                if(result){
                    if(client.verified){
                        const token = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
                        return res.json({client, token})
                    }
                    else {
                        const otp = 'ABCDE';
                        // sendMail({
                        //     mail: client.email,
                        //     subject: 'Please Verify Your Email',
                        //     text: `Verify your email with the code ${otp}`,
                        //     html: `<p>Verify your email with the code <strong>${otp}</strong></p>`
                        // })
                        // .then(() => {
                            Client.updateOne({_id: client._id}, {otp})
                            .then(() => {
                                delete client.otp;
                                return res.json({client})
                            })
                            .catch(err => console.log(err))
                        // });
                    }
                }
                else next({message: 'Incorrect Email or Password', status: 401});
            })
        else next({status: 404, message: 'Incorrect Email or Password'})
    })
    .catch(err => next({status: 400, message: 'Incorrect Email or Password'}))
}

exports.clientVerifyOtp = (req, res, next) => {
    console.log(req.body);
    Client.findOne({email: req.body.email})
    .then(resp => resp.toJSON())
    .then(client => {
        if(req.body.otp.toUpperCase() === client.otp.toUpperCase()){
            Client.updateOne({email: client.email}, {verified: true}, {$unset: {otp: 1}})
            .then(client => {
                delete client.password;
                const token = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
                return res.json({client, token});
            })
        }
        else {
            return next({status: 400, message: 'Incorrect PIN'})
        }
    })
}

exports.clientUpdateInfo = (req, res, next) => {
    const client = req.body.payload.client;
    if(client._id !== req._id)
        return next({status: 403, message: 'Incorrect ID'})
    Client.updateOne({_id: req.body.payload.client._id}, req.body)
    .then(resp => {
        return res.json({status: 200})
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