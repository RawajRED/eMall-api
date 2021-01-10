const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productVariantSchema = new Schema({
    type: {
        type: String,
        enum: ['Size', 'Color'],
        required: true
    },
    stock: Number,
    price: Number,
    images: [String],
});

const productVariantModel = mongoose.model('ProductVariant', productVariantSchema);

module.exports = productVariantModel;