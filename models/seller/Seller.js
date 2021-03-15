const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Store = require('./Store');

const sellerSchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
    },
    title: {
        type: String,
        default: 'Store Manager'
    },
    facebookId: String,
    password: String,
    phone: String,
    image: String,
    resetOtp: String,
    languagePref: {
        type: Number,
        default: 0
    },
    /**
     * ? Authority Levels
     * * 0 - Manage Members
     * * 1 - Edit Store
     * * 2 - Edit Products
     * * 3 - Edit ads
     * * 4 - Withdraw funds
     * * 5 - Edit Page
     */
    authorities: [Number]
});

sellerSchema.post('save', function(doc){
    mongoose.model('Store').findOneAndUpdate({_id: doc.store}, {$push: {sellers: doc._id}});
});


const sellerModel = mongoose.model('Seller', sellerSchema);

module.exports = sellerModel;
