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
            .catch(err => next(err))
        })
        .catch(err => next({status: 500, message: 'Internal Server Error'}))
    })
    .catch(err => next({status: 403, errors: [{msg: err}]}));
}

exports.sellerSignInEmail = (req, res, next) => {
    Seller.findOne({email: req.body.email})
    .populate({
        path: 'store',
        select: 'approved logo title'
    })
    .then(resp => resp.toJSON())
    .then(seller => {
        if(seller) {
            bcrypt.compare(req.body.password, seller.password)
            .then(result => {
                console.log('result', result)
                if(result){
                    delete seller.password;
                    const token = jwt.sign({ seller }, req.app.get('secret_key'), { expiresIn: '90d'});
                    const store = seller.store;
                    delete seller.store;
                    console.log({seller, store, token, type: 'store'})
                    return res.json({seller, store, token, type: 'store'})
                } else throw new Error();
            })
            .catch(err => next({status: 403, errors: [{msg: `Incorrect email or password` }]}))
        }
        else next({status: 403, errors: [{msg: `Incorrect email or password` }]})
    })
    .catch(err => next({status: 403, errors: [{msg: `Incorrect email or password` }]}))
}

exports.sellerSignInFacebook = (req, res, next) => {
    Seller.findOne({facebookId: req.body.id})
    .populate({
        path: 'store',
        select: 'approved logo title'
    })
    .then(resp => {
        if(resp)
            return resp.toJSON()
        else {
            
        }
        resp.toJSON()
    })
    .then(seller => {
        const token = jwt.sign({ seller }, req.app.get('secret_key'), { expiresIn: '90d'});
        return res.json({seller, store, token})
    })
    .catch(err => {
        Seller.findOneAndUpdate({email: req.body.email}, {facebookId: req.body.id}, {new: true})
        .populate({
            path: 'store',
            select: 'approved logo title'
        })
            .then(resp => resp.toJSON())
            .then(seller => {
                if(seller) {
                    const token = jwt.sign({ seller }, req.app.get('secret_key'), { expiresIn: '90d'});
                    const store = seller.store;
                    delete seller.store;
                    console.log({store, seller, token})
                    return res.json({store, seller, token});
                } else return next({status: 404, msg: `No Store registered on this Facebook account`});
            })
            .catch(err => next({status: 404, msg: `No Store registered on this Facebook account`}));
    })
}

exports.sellerEditStore = (req, res, next) => {
    Store.findOneAndUpdate({_id: req.body._id}, req.body.data, {new: true})
    .then(resp => resp ? res.json(resp) : next({status: 404, message: 'Store not found'}))
    .catch(err => next(err));
}