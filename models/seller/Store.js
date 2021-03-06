const StorePage = require('./StorePage');
const Product = require('./product/Product');
const Seller = require('./Seller');
const StoreReview = require('./StoreReview');
const StoreView = require('./StoreView');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
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
    otherCategory: String,
    logo: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'StoreReview'
    }],
    credit: {
        type: Number,
        default: 0
    },
    facebookPage: String,
    website: String,
    bankInfo: String,
    performance: {
        type: Number,
        default: 0
    },
    daysTillPaid:{
        type : Number,
        default : 14
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    addresses: [{
        governate: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        building: {
            type: String,
            required: true
        },
        apartment: {
            type: String,
            required: true
        },
        extra: {
            type: String,
            default: ''
        },
        active: {
            type: Boolean,
            default: false
        }
    }]
}, {timestamps: { createdAt: 'created_at'}});

storeSchema.post('save', function(doc){
    StorePage.create({store: doc._id})
    .then(resp => resp.toJSON())
    .then(page => {
        storeModel.findOneAndUpdate(doc, {page: page._id})
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err));
    
});

storeSchema.post('remove', function(doc){
    StorePage.deleteOne({store: doc._id});
    Product.deleteMany({store: doc._id});
    Seller.deleteMany({store: doc._id});
    
});


const storeModel = mongoose.model('Store', storeSchema);

module.exports = storeModel;
