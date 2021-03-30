const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerAdSchema = new Schema({
    // ? 0 - Product Ad
    // ? 1 - Store Ad
    adType: Number,
    image: String,
    renew: {
        type: Boolean,
        default: false
    },
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    clicks: [{
        type: Schema.Types.ObjectId,
        ref: 'Client'
    }],
    lastRenew: {
        type: Date
    }
}, {timestamps: { createdAt: 'created_at'}});

    const bannerAdModel = mongoose.model('BannerAd', bannerAdSchema);

module.exports = bannerAdModel;