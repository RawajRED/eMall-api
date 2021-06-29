const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Store = require('../Store');

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
            type: String
        },
        ar: {
            type: String
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
    filter: {
        type: Schema.Types.ObjectId,
        ref: 'Filter',
    },
    discount: Number,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'ProductReview'
    }],
    options: [{
        title: {
            en: String,
            ar: String
        },
        options: [{
            title: {
                en: String,
                ar: String
            },
            extraPrice: Number,
            stock: Number
        }]
    }],
    variants: {
        type: Schema.Types.ObjectId,
        ref: 'ProductVariant'
    },
    images: [String],
    stock: Number,
    price: Number,
    currency: String,
    extraText: Boolean,
    extraImage: Boolean,
    specifications: [{
        title: {
            en: String,
            ar: String
        },
        details: {
            en: String,
            ar: String
        }
    }],
    dealOfTheDay: {
        type: Schema.Types.ObjectId,
        ref: 'DealOfTheDay'
    },
    isDeleted : {
        type : Boolean,
        default : false 
    },
    isStoreDeleted : {
        type : Boolean,
        default : false 
    }
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

productSchema.pre('remove', function() {
    Store.updateOne({_id: this.store}, {$pull: {products: this._id}})
})

const productModel = mongoose.model('Product', productSchema);

module.exports = productModel;
