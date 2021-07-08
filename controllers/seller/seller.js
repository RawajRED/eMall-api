const Seller = require('../../models/seller/Seller');
const Store = require('../../models/seller/Store');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateOtp = (number = 5) => Array.from(Array(number).keys()).map(() => Math.floor(Math.random()*10)).join("");

exports.createSeller = (req, res, next) => {
    const password = req.body.password;
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds)
    .then(hash => {
        req.body.password = hash ;
        req.body.authorities = req.body.authorities.split(';');
        Seller.create(req.body)
        .then(sellers => sellers.toJSON())
        .then(sellers => res.json(sellers));
    })
}

exports.createStoreAndSellerEmail = (req, res, next) => {
    const store = {
        title: req.body.store.title,
        description: req.body.store.description,
        categories: req.body.store.categories,
        otherCategory: req.body.store.otherCategory,
        logo: req.body.store.logo,
        addresses: req.body.store.addresses
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
        select: 'approved logo title page',
        populate: {path: 'page', select: 'coverImage'}
    })
    .then(resp => resp.toJSON())
    .then(seller => {
        if(seller) {
            bcrypt.compare(req.body.password, seller.password)
            .then(result => {
                if(result){
                    delete seller.password;
                    const accessToken = jwt.sign({ seller }, req.app.get('secret_key'), { expiresIn: '90d'});
                    const refreshToken = jwt.sign({ seller }, req.app.get('secret_key'), { expiresIn: '365d'});
                    const store = seller.store;
                    delete seller.store;
                    return res.json({seller, store, accessToken, refreshToken, type: 'store'})
                } else throw next({status: 403, errors: [{msg: {en: `Incorrect email or password`, ar: 'بريد أو كلمة مرورغير صحيحة'} }]});
            })
            .catch(err => next({status: 403, errors: [{msg: {en: `Incorrect email or password`, ar: 'بريد أو كلمة مرورغير صحيحة'} }]}))
        }
        else next({status: 403, errors: [{msg: {en: `Incorrect email or password`, ar: 'بريد أو كلمة مرورغير صحيحة'} }]})
    })
    .catch(err => next({status: 403, errors: [{msg: {en: `Incorrect email or password`, ar: 'بريد أو كلمة مرورغير صحيحة'} }]}))
}

exports.sellerLoginToken = (req, res, next) => {
    Seller.findOne({_id: req.body.seller._id})
    .populate({
        path: 'store',
        select: 'approved logo title page',
        populate: {path: 'page', select: 'coverImage'}
    })
    .then(seller => {
        delete seller.password;
        const store = seller.store;
        delete seller.store;
        return res.json({seller, store, type: 'store'})
    })
    .catch(err => next(err));
}

exports.sellerRefreshToken = (req, res, next) => {
    Seller.findOne({_id: req.body.seller._id})
    .populate({
        path: 'store',
        select: 'approved logo title page',
        populate: {path: 'page', select: 'coverImage'}
    })
    .then(seller => {
        const accessToken = jwt.sign({ client: client._id }, req.app.get('secret_key'), { expiresIn: '90d'});
        delete seller.password;
        const store = seller.store;
        delete seller.store;
        return res.json({seller, store, type: 'store', accessToken})
    })
    .catch(err => next(err));
}

exports.sellerSignInFacebook = (req, res, next) => {
    Seller.findOne({facebookId: req.body.id})
    .populate({
        path: 'store',
        select: 'approved logo title page',
        populate: {path: 'page', select: 'coverImage'}
    })
    .then(resp => {
        if(resp)
            return resp.toJSON()
        else {
            
        }
        resp.toJSON()
    })
    .then(seller => {
        const accessToken = jwt.sign({ seller }, req.app.get('secret_key'), { expiresIn: '90d'});
        const refreshToken = jwt.sign({ seller }, req.app.get('secret_key'), { expiresIn: '3650d'});
        return res.json({seller, store, accessToken, refreshToken});
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
                    const accessToken = jwt.sign({ seller }, req.app.get('secret_key'), { expiresIn: '90d'});
                    const refreshToken = jwt.sign({ seller }, req.app.get('secret_key'), { expiresIn: '3650d'});
                    const store = seller.store;
                    delete seller.store;
                    return res.json({store, seller, accessToken, refreshToken});
                } else return next({status: 404, msg: `No Store registered on this Facebook account`});
            })
            .catch(err => next({status: 404, msg: `No Store registered on this Facebook account`}));
    })
}

exports.sellerForgotPassword = (req, res, next) => {
    const otp = createId(4);
    Seller.findOneAndUpdate({email: req.body.email}, {resetOtp: otp}, {new: true})
    .then(seller => {
        res.json({confirm: true})
    })
    .catch(err => next(err));
}

exports.sellerChangePassword = (req, res, next) => {
    Seller.findOne({email: req.body.email, resetOtp: req.body.otp})
    .then(seller => {
        if(!seller) return res.json({confirmed: false})
        const password = req.body.password;
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if(err) throw new Error(err);
            Seller.findOneAndUpdate({_id: seller._id}, {password: hash})
            .then(() => {
                res.json({confirmed: true});
            })
        });
    })
    .catch(err => next(err));
}

exports.sellerCheckOtp = (req, res, next) => {
    Seller.findOne({email: req.body.email})
    .then(seller => {
        if(seller.resetOtp === req.body.otp.toUpperCase())
            return res.json({confirmed: true})
        return res.json({confirmed: false})
    })
    .catch(err => next(err));
}

exports.sellerEditStore = (req, res, next) => {
    Store.findOneAndUpdate({_id: req.body._id}, req.body.data, {new: true})
    .then(resp => resp ? res.json(resp) : next({status: 404, message: 'Store not found'}))
    .catch(err => next(err));
}

exports.getSellers = (req, res, next) => {
    const store = req.body.store;
    Seller.find({store: store._id})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.sellerCreateMember = (req, res, next) => {
    const store = req.body.store;
    const member = req.body.member;

    const saltRounds = 10;
    bcrypt.hash(member.password, saltRounds)
    .then(memberPass => {
        Seller.create({
            store: store._id,
            name: member.name,
            email: member.email,
            title: member.title,
            password: memberPass,
            phone: member.phone,
            authorities: member.authorities
        })
        .then(() => {
            Seller.find({store: store._id})
            .then(resp => res.json(resp))
            .catch(err => next(err));
        })
        .catch(err => next(err));
    });
}

exports.sellerUpdateMember = (req, res, next) => {
    Seller.findOneAndUpdate({_id: req.body.member._id}, req.body.member, {new: true})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

const createId = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    // create ID
    return result;
 }