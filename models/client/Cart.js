const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        },
        image: String,
        text: String,
        options: [{
             // ? Option is the ID of the outer option object (e.g Color, Size, etc..)
            option: Schema.Types.ObjectId,
            
            // ? Pick is the ID of the inner object, aka which suboption was picked from the options (e.g Small, Large, XXL)
            pick: Schema.Types.ObjectId
        }],
        code: String
    }],
    subtotal: Number
});

const cartModel = mongoose.model('Cart', cartSchema);

module.exports = cartModel;
