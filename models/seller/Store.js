const StorePage = require('./StorePage');
const Product = require('./product/Product');
const Seller = require('./Seller');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    page: {
        type: Schema.Types.ObjectId,
        ref: 'StorePage'
    },
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: []
    }],
    subcategories: [{
        type: Schema.Types.ObjectId,
        ref: 'Subcategory',
        default: []
    }],
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: []
    }],
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order',
        default: []
    }],
    payments: [{
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        default: []
    }],
    sellers: [{
        type: Schema.Types.ObjectId,
        ref: 'Seller',
        default: []
    }],
    withdrawalRequests: [{
        type: Schema.Types.ObjectId,
        ref: 'withdrawalRequest',
        default: []
    }],
    approved: {
        type: Boolean,
        default: false
    },
    logo: String,
    credit: Number,
    facebookPage: String,
    website: String,
    bankInfo: String
}, {timestamps: { createdAt: 'created_at'}});

storeSchema.post('save', (doc) => {
    StorePage.create({store: doc._id})
    .then(resp => resp.toJSON())
    .then(page => {
        storeModel.findOneAndUpdate(doc, {page: page._id})
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err));
    
});

storeSchema.post('remove', (doc) => {
    StorePage.deleteOne({store: doc._id});
    Product.deleteMany({store: doc._id});
    Seller.deleteMany({store: doc._id});
});


const storeModel = mongoose.model('Store', storeSchema);

module.exports = storeModel;
