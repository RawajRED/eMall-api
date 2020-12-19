const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Cart = require('./Cart');
const Wishlist = require('./Wishlist');

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
    email: String,
    image: String,
    verified: {
        type: Boolean,
        default: false
    },
    otp: String,
    orders: {
        type: [Schema.Types.ObjectId],
        ref: 'Order'
    },
    payments: {
        type: [Schema.Types.ObjectId],
        ref: 'Payment'
    },
    cartId: {
        type: Schema.Types.ObjectId,
        ref: 'Cart'
    },
    wishlistId: {
        type: Schema.Types.ObjectId,
        ref: 'Wishlist'
    },
    reviews: {
        type: [Schema.Types.ObjectId],
        ref: 'Reviews'
    },
    viewed: {
        type: [Schema.Types.ObjectId],
        ref: 'Product'
    },    suspended:{
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
    }
});

clientSchema.post('save', (doc) => {
    Cart.create({clientId: doc._id})
    .then(() =>
        Wishlist.create({clientId: doc._id})
    )
});

clientSchema.post('remove', (doc) => {
    Cart.remove({clientId: doc._id})
    .then(() =>
        Wishlist.remove({clientId: doc._id})
    )
});



const clientModel = mongoose.model('Client', clientSchema);

module.exports = clientModel;
