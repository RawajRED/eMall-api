const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    title: {
        en: {
            type: String,
            required: true
        },
        ar: {
            type: String,
            required: true
        },   
    },
    description: {
        en: {
            type: String,
            required: true
        },
        ar: {
            type: String,
            required: true
        },   
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true
    },
    variantTypes: {
        type: [Schema.Types.ObjectId],
        ref: 'VariantTypes',
    },
    variants: {
        type: [Schema.Types.ObjectId],
        ref: 'ProductVariant',
    },
    image: String,
});


const productModel = mongoose.model('Product', productSchema);

module.exports = productModel;
