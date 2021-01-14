const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productVariantSchema = new Schema({
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        variant: {
            en: String,
            ar: String
        }
    }],
    title: {
        en: String,
        ar: String
    }
});

const productVariantModel = mongoose.model('ProductVariant', productVariantSchema);

module.exports = productVariantModel;