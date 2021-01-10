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
    discount: Number,
    discountPeriod: Date,
    reviews: {
        type: [Schema.Types.ObjectId],
        ref: 'ProductReview'
    },
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
            extraPrice: Number
        }]
    }],
    variants: [{
        name: {
            en: String,
            ar: String
        },
        options: [{
            variety: {
                en: String,
                ar: String,
            },
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
            image: String
        }]
    }],
    images: [String],
    stock: Number,
    price: Number,
    currency: String,
    specifications: [{
        title: {
            en: String,
            ar: String
        },
        details: {
            en: String,
            ar: String
        }
    }]
});

productSchema.post('save', doc => {
    Store.updateOne({_id: doc.store}, {$push: {products: doc._id}})
    .then(resp => {
        console.log('success!', resp);
    })
    .catch(err => console.log('ERR!!!!', err));
})

productSchema.pre('remove', () => {
    Store.updateOne({_id: doc.store}, {$pull: {products: this._id}})
})

const productModel = mongoose.model('Product', productSchema);

module.exports = productModel;
