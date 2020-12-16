const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    country: String,
    city: String,
    phone: String,
    email: String,
    verified: Boolean,
    password: {
        type: String,
        required: true
    },
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
    }
});

const clientModel = mongoose.model('Client', clientSchema);

module.exports = clientModel;