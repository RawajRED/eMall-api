const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    products: {
        type: [Schema.Types.ObjectId],
        ref: 'Product'
    }
});

const wishlistModel = mongoose.model('Wishlist', wishlistSchema);

module.exports = wishlistModel;