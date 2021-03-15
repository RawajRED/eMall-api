const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Cart = require('./Cart');
const Wishlist = require('./Wishlist');
const StoreReview = require('../seller/StoreReview');
const ProductReview = require('../seller/product/ProductReview');


const clientSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: String,
    country: String,
    city: String,
    phone: String,
    resetOtp: String,
    email: {
        type: String,
        unique: true
    },
    image: String,
    verified: {
        type: Boolean,
        default: false
    },
    otp: String,
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order',
        default: []
    }],
    payments: [{
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        default: []
    }],
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'Cart'
    },
    wishlist: {
        type: Schema.Types.ObjectId,
        ref: 'Wishlist'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Reviews'
    }],
    viewed: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    suspended:{
        type: Boolean,
        default :false
    },
    languagePref: {
    /* 
        0: English
        1: Arabic
    */
        type: Number,
        default: 0
    },
    facebookId: String,
    image: String,
    credit: {
        type: Number,
        default: 0
    },
    addresses: [{
        governate: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        building: {
            type: String,
            required: true
        },
        apartment: {
            type: String,
            required: true
        },
        extra: String,
        active: {
            type: Boolean,
            default: false
        }
    }]
});

clientSchema.pre('save', function(next){
    console.log(`---------------------------POST SAVE--------------------------`);
    console.log('doc is', this);
    Cart.create({client: this._id})
    .then(resp => resp.toJSON())
    .then((cart) => {
        console.log(`Created a cart!`, cart)
        Wishlist.create({client: this._id})
        .then(resp => resp.toJSON())
        .then(wishlist => {
            console.log(`Created a wishlist!`, wishlist)
            this.cart = cart._id;
            this.wishlist = wishlist._id;
            next();
        })
        .catch(err => next(err))
    }
    )
    .catch(err => next(err))
});

clientSchema.post('remove', function(doc){
    const promises = [];
    promises.push(Cart.remove({client: doc._id}));
    promises.push(Wishlist.remove({client: doc._id}))
    promises.push(StoreReview.remove({client: doc._id}))
    promises.push(ProductReview.remove({client: doc._id}))
    Promise.all(promises)
});

const clientModel = mongoose.model('Client', clientSchema);

module.exports = clientModel;
