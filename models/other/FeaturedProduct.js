const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const featuredProductSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        unique: true
    }
}, {timestamps: { createdAt: 'created_at'}});

const featuredProductModel = mongoose.model('FeaturedProduct', featuredProductSchema);

module.exports = featuredProductModel;