const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const homeAdSchema = new Schema({
    // ? The ad number (pagination) on the front page
    page: Number,

    // ? 0 - Product Ad
    // ? 1 - Store Ad
    adType: Number,
    image: String,
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    active: {
        type: Boolean,
        default: false
    },
    activeDate: Date,
    bid: {
        type: Number,
        default: 0
    },
    clicks: [{
        type: Schema.Types.ObjectId,
        ref: 'Client'
    }]
});

const homeAdModel = mongoose.model('HomeAd', homeAdSchema);

module.exports = homeAdModel;