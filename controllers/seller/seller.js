const Seller = require('../../models/seller/Seller');
const Store = require('../../models/seller/Store');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateOtp = () => {
    return 'ABCDE';
}

exports.createStoreAndSellerEmail = (req, res, next) => {
    const store = {
        title: req.body.store.title,
        description: req.body.store.description,
        categories: req.body.store.categories
    }
    Store.create(store)
    .then(res => res.toJSON())
    .then(store => {
        const password = req.body.seller.password;
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds)
        .then(hash => {
            const otp = generateOtp();
            const seller = {
                store: store._id,
                name: req.body.seller.name,
                email: req.body.seller.email,
                password: hash,
                title: req.body.seller.title,
                phone: req.body.phone,
                authorities: [1,2,3,4,5],
                otp
            }
            if(req.body.seller.facebookId)
                seller.facebookId = req.body.seller.facebookId;
            Seller.create(seller)
            .then(seller => seller.toJSON())
            .then(seller => res.json({seller, store}))
            .catch(err => next({status: 403, errors: [{msg: 'Email is already taken, try signing in', param: 'seller.email'}]}))
        })
        .catch(err => next({status: 500, message: 'Internal Server Error'}))
    })
    .catch(err => next({status: 403, errors: [{msg: err}]}));
}

exports.sellerSignInEmail = (req, res, next) => {
    Seller.findOne({email: req.body.email})
    .then(resp => resp.toJSON())
    .then(seller => {
        if(seller) {
            bcrypt.compare(req.body.password, seller.password)
            .then(result => {
                if(result){
                    Store.findOne({_id: seller.store})
                    .then(resp => resp.toJSON())
                    .then(store => {
                        if(store){
                            const token = jwt.sign({ seller }, req.app.get('secret_key'), { expiresIn: '90d'});
                            console.log(seller, store, token)
                            return res.json({seller, store, token})
                        } else return next({status: 404, errors: [{msg: `Couldn't find store` }]})
                    })
                   .catch(err => next({status: 404, errors: [{msg: `Couldn't find store` }]}))
                } else throw new Error();
            })
            .catch(err => next({status: 403, errors: [{msg: `Incorrect email or password` }]}))
        }
        else next({status: 403, errors: [{msg: `Incorrect email or password` }]})
    })
    .catch(err => next({status: 403, errors: [{msg: `Incorrect email or password` }]}))
}

exports.sellerSignInFacebook = (req, res, next) => {
    console.log(req.body);
    Seller.findOne({facebookId: req.body.id})
    .then(resp => {
        if(resp)
            return resp.toJSON()
        else {
            
        }
        resp.toJSON()
    })
    .then(seller => {
        Store.findOne({_id: seller.store})
        .then(resp => resp.toJSON())
        .then(store => {
            console.log('store', store)
            if(store){
                const token = jwt.sign({ seller }, req.app.get('secret_key'), { expiresIn: '90d'});
                return res.json({seller, store, token})
            }
            else return next({status: 404, errors: [{msg: `Couldn't find store` }]})
        })
        .catch(err => next({status: 404, errors: [{msg: `Couldn't find store`}]}));
    })
    .catch(err => {
        Seller.findOneAndUpdate({email: req.body.email}, {facebookId: req.body.id}, {new: true})
            .then(resp => resp.toJSON())
            .then(seller => {
                if(seller) {
                        Store.findOne({_id: seller.store})
                        .then(store => store.toJSON())
                        .then(store => {
                            if(store) {
                                const token = jwt.sign({ seller }, req.app.get('secret_key'), { expiresIn: '90d'});
                                return res.json({store, seller, token});
                            }
                        })
                        .catch(err => next({status: 400, errors: [{msg: `Couldn't find store`}]}))
                } else return next({status: 404, msg: `No Store registered on this Facebook account`});
            })
            .catch(err => next({status: 404, msg: `No Store registered on this Facebook account`}));
    })
}