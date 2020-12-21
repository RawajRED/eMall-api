const { ObjectID } = require('mongodb');
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
    pageId: {
        type: Schema.Types.ObjectId,
        ref: 'Page'
    },
    categories: {
        type: [Schema.Types.ObjectId],
        ref: 'Category',
        default: []
    },
    subcategories: {
        type: [Schema.Types.ObjectId],
        ref: 'Subcategory',
        default: []
    },
    products: {
        type: [Schema.Types.ObjectId],
        ref: 'Product',
        default: []
    },
    orders: {
        type: [Schema.Types.ObjectId],
        ref: 'Order',
        default: []
    },
    payments: {
        type: [Schema.Types.ObjectId],
        ref: 'Payment',
        default: []
    },
    sellers: {
        type: [Schema.Types.ObjectId],
        ref: 'Seller',
        default: []
    },
    withdrawalRequests: {
        type: [Schema.Types.ObjectId],
        ref: 'withdrawalRequest'
    },
    approved: {
        type: Boolean,
        default: false
    },
    logo: String,
    credit: Number,
    bankInfo: String
});

storeSchema.post('save', (doc) => {
    
});

storeSchema.post('remove', (doc) => {
    
});


const storeModel = mongoose.model('Store', storeSchema);

module.exports = storeModel;
