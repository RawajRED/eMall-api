const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    products: {
        type: [Schema.Types.ObjectId],
        ref: 'Product'
    }
});

const cartModel = mongoose.model('Cart', cartSchema);

module.exports = cartModel;