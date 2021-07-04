const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const featuredStoreSchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        unique: true
    }
}, {timestamps: { createdAt: 'created_at'}});

const featuredStoreModel = mongoose.model('FeaturedStore', featuredStoreSchema);

module.exports = featuredStoreModel;