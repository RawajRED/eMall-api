const { ObjectID } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storePageSchema = new Schema({
    store: {
        required: true,
        unique: true,
        type: Schema.Types.ObjectId,
        ref: 'Store'
    },
    coverImage: String,
    homeAds: [{
        /*
            0 - Static Image
            1 - Product Image
            2 - Product Ad
        */
        adType: Number,
        image: String,
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    }]
});

const storePageModel = mongoose.model('StorePage', storePageSchema);

module.exports = storePageModel;